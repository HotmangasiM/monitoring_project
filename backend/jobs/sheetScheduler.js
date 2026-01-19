const cron = require('node-cron');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const db = require('../db');

// URL SPREADSHEET
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1rtYvS3eXwnBvbRGn3gLupf6cqSmSfXR2t1SYDELRD5k/export?format=csv";

  // URL Data Real
  // https://docs.google.com/spreadsheets/d/1x6s-oDKBX8ulZOGQ9cWldwiceVmwLdWfQtpOC73s6mI/export?format=csv

function startSheetScheduler() {
  cron.schedule("*/20 * * * * *", async () => {
    console.log("Scheduler start...");

    try {
      // 1️⃣ Ambil master sensor
      const [sensors] = await db.query(
        "SELECT sensor_name FROM sensors WHERE is_active = 1 LIMIT 20"
      );

      const allowedSensors = sensors.map(s => s.sensor_name);
      console.log("Allowed sensors:", allowedSensors);

      // 2️⃣ Fetch CSV
      const response = await axios.get(SHEET_CSV_URL);
      const csvData = response.data;

      // 3️⃣ Parse CSV (SYNC & SIMPLE)
      const records = parse(csvData, {
        skip_empty_lines: true
      });

      // 4️⃣ Build snapshot
      const now = new Date();
      const snapshot = [];

      for (const row of records) {
        const sensorName = row[0];
        const value = Number(row[1]);

        if (!allowedSensors.includes(sensorName)) continue;
        if (isNaN(value)) continue;

        snapshot.push({
          sensor_name: sensorName,
          value,
          collected_at: now
        });
      }

      console.log("📊 Snapshot result:", snapshot);

      if (snapshot.length > 0) {
        const values = snapshot.map(item => [
            item.sensor_name,
            item.value,
            item.collected_at
        ]);

        await db.query(
            "INSERT INTO sensor_data (sensor_name, value, collected_at) VALUES ?",
            [values]
        );

        console.log(`✅ Inserted ${values.length} rows into sensor_data`);
        } else {
        console.log("⚠️ No valid sensor data to insert");
        }


    } catch (error) {
      console.error("Scheduler error:", error.message);
    }
  });
}

module.exports = startSheetScheduler;
