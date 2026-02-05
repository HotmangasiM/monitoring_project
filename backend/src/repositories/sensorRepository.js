const db = require("../config/db");

/* Latest snapshot */
async function getLatestSnapshot() {
  const [rows] = await db.query(`
    SELECT sd.sensor_name, sd.value, sd.collected_at
    FROM sensor_data sd
    INNER JOIN (
      SELECT sensor_name, MAX(collected_at) AS last_time
      FROM sensor_data
      GROUP BY sensor_name
    ) latest
    ON sd.sensor_name = latest.sensor_name
    AND sd.collected_at = latest.last_time
    ORDER BY CAST(SUBSTRING(sd.sensor_name, 8) AS UNSIGNED)
  `);

  return rows;
}

/* History */
async function getSensorHistory(sensor, limit) {
  const [rows] = await db.query(`
    SELECT value, collected_at
    FROM sensor_data
    WHERE sensor_name = ?
    ORDER BY collected_at DESC
    LIMIT ?
  `, [sensor, limit]);

  return rows;
}

/* Trend AVG */
async function getHourlyAvg() {
  const [rows] = await db.query(`
    SELECT
      sd.sensor_name,
      DATE_FORMAT(sd.collected_at, '%Y-%m-%d %H:00:00') AS hour_bucket,
      AVG(sd.value) AS avg_value
    FROM sensor_data sd
    WHERE sd.collected_at >= NOW() - INTERVAL 5 HOUR
    GROUP BY sd.sensor_name, hour_bucket
    ORDER BY sd.sensor_name, hour_bucket
  `);

  return rows;
}

/* Latest values */
async function getLatestValues() {
  const [rows] = await db.query(`
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

  return rows;
}

/* Active sensors */
async function getActiveSensors() {
  const [rows] = await db.query(`
    SELECT DISTINCT sensor_name
    FROM sensor_data
    WHERE collected_at >= NOW() - INTERVAL 5 HOUR
  `);

  return rows;
}

module.exports = {
  getLatestSnapshot,
  getSensorHistory,
  getHourlyAvg,
  getLatestValues,
  getActiveSensors
};
