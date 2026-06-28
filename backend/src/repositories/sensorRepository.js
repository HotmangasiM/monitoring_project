const db = require("../config/db");

/* Latest snapshot */
async function getLatestSnapshot() {
  const [rows] = await db.query(`
    SELECT
      location,
      sensor_code,
      sensor_name,
      unit,
      value,
      collected_at
    FROM (
      SELECT
        l.name AS location,
        st.code AS sensor_code,
        st.label AS sensor_name,
        st.unit,
        sd.value,
        sd.collected_at,
        ROW_NUMBER() OVER (
          PARTITION BY sd.location_id, sd.sensor_code
          ORDER BY sd.collected_at DESC, sd.id DESC
        ) AS rn
      FROM sensor_data sd
      JOIN locations l ON sd.location_id = l.id
      JOIN sensor_types st ON sd.sensor_code = st.code
    ) latest
    WHERE rn = 1
    ORDER BY location, sensor_code
  `);

  return rows;
}

/* History */
async function getSensorHistory(sensor, limit) {
  const [rows] = await db.query(`
    SELECT
      l.name AS location,
      sd.sensor_code,
      st.label AS sensor_name,
      st.unit,
      sd.value,
      sd.collected_at
    FROM sensor_data sd
    JOIN locations l ON sd.location_id = l.id
    JOIN sensor_types st ON sd.sensor_code = st.code
    WHERE sd.sensor_code = ?
    ORDER BY sd.collected_at DESC, sd.location_id DESC, sd.id DESC
    LIMIT ?
  `, [sensor, limit]);

  return rows;
}

/* Trend AVG */
async function getHourlyAvg() {
  const [rows] = await db.query(`
    SELECT
      sd.sensor_code,
      st.label AS sensor_name,
      st.unit,
      DATE_FORMAT(sd.collected_at, '%Y-%m-%d %H:00:00') AS hour_bucket,
      AVG(sd.value) AS avg_value
    FROM sensor_data sd
    JOIN sensor_types st ON sd.sensor_code = st.code
    WHERE sd.collected_at >= (
      SELECT COALESCE(MAX(collected_at), NOW()) - INTERVAL 5 HOUR
      FROM sensor_data
    )
    GROUP BY sd.sensor_code, st.label, st.unit, hour_bucket
    ORDER BY sd.sensor_code, hour_bucket
  `);

  return rows;
}

/* Latest values */
async function getLatestValues() {
  const [rows] = await db.query(`
    SELECT
      sensor_code,
      sensor_name,
      unit,
      value
    FROM (
      SELECT
        sd.sensor_code,
        st.label AS sensor_name,
        st.unit,
        sd.value,
        ROW_NUMBER() OVER (
          PARTITION BY sd.sensor_code
          ORDER BY sd.collected_at DESC, sd.id DESC
        ) AS rn
      FROM sensor_data sd
      JOIN sensor_types st ON sd.sensor_code = st.code
    ) latest
    WHERE rn = 1
  `);

  return rows;
}

/* Active sensors */
async function getActiveSensors() {
  const [rows] = await db.query(`
    SELECT DISTINCT
      sd.sensor_code,
      st.label AS sensor_name,
      st.unit
    FROM sensor_data sd
    JOIN sensor_types st ON sd.sensor_code = st.code
    WHERE sd.collected_at >= (
      SELECT COALESCE(MAX(collected_at), NOW()) - INTERVAL 5 HOUR
      FROM sensor_data
    )
    ORDER BY sd.sensor_code
  `);

  return rows;
}

async function getLastSeen() {
  const [rows] = await db.query(`
    SELECT
      l.name AS location,
      sd.sensor_code AS sensor,
      MAX(sd.collected_at) AS last_seen
    FROM sensor_data sd
    JOIN locations l ON sd.location_id = l.id
    GROUP BY l.id, sd.sensor_code
  `);

  return rows;
}


module.exports = {
  getLatestSnapshot,
  getSensorHistory,
  getHourlyAvg,
  getLatestValues,
  getActiveSensors,
  getLastSeen
};
