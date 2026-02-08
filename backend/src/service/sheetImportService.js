const axios = require("axios");
const { parse } = require("csv-parse/sync");
const repo = require("../repositories/sheetImportRepository");

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1rtYvS3eXwnBvbRGn3gLupf6cqSmSfXR2t1SYDELRD5k/export?format=csv";

const SENSOR_NAME_MAP = {
  "sensor 1": "TEMP",
  "sensor 2": "HUM",
  "sensor 3": "TDS",
  "sensor 4": "PH"
};

async function importSheetSnapshot() {
  console.log("📥 Importing sheet...");

  try {
    const locations = await repo.getActiveLocations();

    const locationMap = {};
    locations.forEach(loc => {
      locationMap[loc.name.toLowerCase()] = loc.id;
    });

    const response = await axios.get(SHEET_CSV_URL, {
      timeout: 15000, // ⬅ penting
      headers: {
        "User-Agent": "monitoring-app"
      }
    });

    const records = parse(response.data, {
      skip_empty_lines: true
    });

    const now = new Date();
    const snapshot = [];

    let currentLocationName = null;

    for (const row of records) {
      let locationCell = row[0]?.trim();
      const sensorCell = row[1]?.trim();
      const value = Number(row[2]);

      if (locationCell) currentLocationName = locationCell;

      if (!currentLocationName || !sensorCell || isNaN(value)) continue;

      const locationId =
        locationMap[currentLocationName.toLowerCase()];

      const sensorCode =
        SENSOR_NAME_MAP[sensorCell.toLowerCase()];

      if (!locationId || !sensorCode) continue;

      snapshot.push([
        locationId,
        sensorCode,
        value,
        now
      ]);
    }

    if (snapshot.length > 0) {
      await repo.insertSnapshot(snapshot);
      console.log(`✅ Inserted ${snapshot.length} rows`);
    } else {
      console.log("⚠️ No valid data");
    }

  } catch (err) {
    console.error("Import error:", err.message);
  }
}

module.exports = {
  importSheetSnapshot
};