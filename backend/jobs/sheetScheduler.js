const cron = require("node-cron");
const axios = require("axios");
const { parse } = require("csv-parse/sync");
const db = require("../db");

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1rtYvS3eXwnBvbRGn3gLupf6cqSmSfXR2t1SYDELRD5k/export?format=csv";

function startSheetScheduler() {
  cron.schedule("*/20 * * * * *", async () => {
    console.log("⏱️ Scheduler running...");

    try {
      /* =====================================
         1. Ambil sensor aktif (maks 20)
         ===================================== */
      const [sensorRows] = await db.query(`
        SELECT sensor_name
        FROM sensors
        WHERE is_active = 1
        LIMIT 20
      `);

      const allowedSensors = sensorRows.map(r => r.sensor_name);
      if (allowedSensors.length === 0) {
        console.log("⚠️ No active sensors");
        return;
      }

      /* =====================================
         2. Ambil snapshot terakhir DB
         ===================================== */
      const [latestRows] = await db.query(`
        SELECT sd.sensor_name, sd.value
        FROM sensor_data sd
        INNER JOIN (
          SELECT sensor_name, MAX(collected_at) AS last_time
          FROM sensor_data
          GROUP BY sensor_name
        ) latest
        ON sd.sensor_name = latest.sensor_name
        AND sd.collected_at = latest.last_time
      `);

      const lastValueMap = {};
      latestRows.forEach(r => {
        lastValueMap[r.sensor_name] = r.value;
      });

      /* =====================================
         3. Fetch & parse CSV
         ===================================== */
      const response = await axios.get(SHEET_CSV_URL, { timeout: 10000 });

      const records = parse(response.data, {
        skip_empty_lines: true
      });

      const now = new Date();
      const snapshot = [];

      for (const row of records) {
        const sensorName = row[0]?.trim();
        const value = Number(row[1]);

        if (!sensorName) continue;
        if (!allowedSensors.includes(sensorName)) continue;
        if (isNaN(value)) continue;

        // ⛔ skip jika value sama dengan snapshot terakhir
        if (lastValueMap[sensorName] === value) continue;

        snapshot.push({
          sensor_name: sensorName,
          value,
          collected_at: now
        });
      }

      /* =====================================
         4. Insert batch
         ===================================== */
      if (snapshot.length === 0) {
        console.log("ℹ️ No new sensor changes");
        return;
      }

      const values = snapshot.map(s => [
        s.sensor_name,
        s.value,
        s.collected_at
      ]);

      await db.query(
        "INSERT INTO sensor_data (sensor_name, value, collected_at) VALUES ?",
        [values]
      );

      console.log(`✅ Inserted ${values.length} new sensor rows`);

      /* =====================================
         5. Update sync_state
         ===================================== */
      await db.query(`
        INSERT INTO sync_state (source_name, last_sync)
        VALUES ('google_sheet', NOW())
        ON DUPLICATE KEY UPDATE last_sync = NOW()
      `);

    } catch (err) {
      console.error("❌ Scheduler error:", err.message);
    }
  });
}

module.exports = startSheetScheduler;
