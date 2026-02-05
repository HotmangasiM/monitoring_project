const db = require("../config/db");

async function getLatestDashboardSnapshot() {
  const [rows] = await db.query(`
    SELECT
      l.id   AS location_id,
      l.name AS location_name,

      st.code AS sensor_code,
      st.label AS sensor_name,
      st.unit,

      sd.value
    FROM sensor_data sd
    JOIN locations l
      ON sd.location_id = l.id
    JOIN sensor_types st
      ON sd.sensor_code = st.code
    JOIN (
      SELECT
        location_id,
        sensor_code,
        MAX(collected_at) AS latest_time
      FROM sensor_data
      GROUP BY location_id, sensor_code
    ) latest
      ON sd.location_id = latest.location_id
     AND sd.sensor_code = latest.sensor_code
     AND sd.collected_at = latest.latest_time
    ORDER BY l.id, st.code
  `);

  return rows;
}

async function getDashboardTrend() {
  const [rows] = await db.query(`
    SELECT
      l.id   AS location_id,
      l.name AS location_name,

      st.code AS sensor_code,

      DATE_FORMAT(sd.collected_at, '%Y-%m-%d %H:00:00') AS hour_bucket,
      AVG(sd.value) AS avg_value

    FROM sensor_data sd
    JOIN locations l
      ON sd.location_id = l.id
    JOIN sensor_types st
      ON sd.sensor_code = st.code

    WHERE sd.collected_at >= NOW() - INTERVAL 5 HOUR

    GROUP BY
      l.id,
      st.code,
      hour_bucket

    ORDER BY l.id, st.code, hour_bucket
  `);

  return rows;
}

module.exports = {
  getLatestDashboardSnapshot,
  getDashboardTrend
};
