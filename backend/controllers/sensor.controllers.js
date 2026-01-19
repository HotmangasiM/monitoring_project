const db = require('../db');

exports.getLatestSnapshot = async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT sensor_name, value, collected_at
    FROM sensor_data
    WHERE collected_at = (
      SELECT MAX(collected_at) FROM sensor_data sd
      WHERE sd.sensor_name = sensor_data.sensor_name
    )
    ORDER BY CAST(SUBSTRING(sensor_name, 8) AS UNSIGNED)
  `);
  res.json(rows);
  } catch (error) {
    console.log("Query Error");
  }
};

exports.getSensorHistory = async (req, res) => {
  try {
    const { sensor, limit = 50 } = req.query;

  const [rows] = await db.query(
    `SELECT value, collected_at
     FROM sensor_data
     WHERE sensor_name = ?
     ORDER BY collected_at DESC
     LIMIT ?`,
    [sensor, Number(limit)]
  );

  res.json(rows.reverse());
  } catch (error) {
    console.log("Query error");
  }
};

exports.getSensorTrend = async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT sensor_name, value, collected_at
    FROM (
      SELECT 
        sensor_name,
        value,
        collected_at,
        ROW_NUMBER() OVER (
          PARTITION BY sensor_name 
          ORDER BY collected_at DESC
        ) rn
      FROM sensor_data
    ) t
    WHERE rn <= 30
    ORDER BY sensor_name, collected_at
  `);

  res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

