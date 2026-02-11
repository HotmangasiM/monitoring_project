const db = require("../config/db");

async function getMonitoringRange(from, to) {
    const [rows] = await db.query(`
    SELECT
      l.name AS location,
      sd.sensor_code AS sensor,
      DATE_FORMAT(sd.collected_at, '%Y-%m-%d %H:00:00') AS hour,
      ROUND(AVG(sd.value), 1) AS avg
    FROM sensor_data sd
    JOIN locations l ON sd.location_id = l.id
    WHERE sd.collected_at BETWEEN ? AND ?
    GROUP BY l.id, sd.sensor_code, hour
    ORDER BY hour
  `, [from, to]);

  return rows;
}

module.exports = {
    getMonitoringRange
};