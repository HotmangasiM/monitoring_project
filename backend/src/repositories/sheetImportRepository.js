const db = require("../config/db");

async function getActiveLocations() {
  const [rows] = await db.query(
    "SELECT id, name FROM locations WHERE is_active = 1"
  );
  return rows;
}

async function insertSnapshot(snapshot) {
  if (snapshot.length === 0) return;

  await db.query(
    `INSERT INTO sensor_data
     (location_id, sensor_code, value, collected_at)
     VALUES ?`,
    [snapshot]
  );
}

module.exports = {
  getActiveLocations,
  insertSnapshot
};