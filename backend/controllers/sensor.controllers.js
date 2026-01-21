const db = require('../db');

/* =========================================================
   GET LATEST SNAPSHOT
   ========================================================= */
exports.getLatestSnapshot = async (req, res) => {
  try {
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

    res.json(rows);
  } catch (error) {
    console.error("getLatestSnapshot error:", error);
    res.status(500).json({ error: "Failed to get latest snapshot" });
  }
};

/* =========================================================
   GET SENSOR HISTORY (RAW DATA)
   ========================================================= */
exports.getSensorHistory = async (req, res) => {
  try {
    const { sensor, limit = 50 } = req.query;

    if (!sensor) {
      return res.status(400).json({ error: "sensor query is required" });
    }

    const [rows] = await db.query(
      `
      SELECT value, collected_at
      FROM sensor_data
      WHERE sensor_name = ?
      ORDER BY collected_at DESC
      LIMIT ?
      `,
      [sensor, Number(limit)]
    );

    res.json(rows.reverse());
  } catch (error) {
    console.error("getSensorHistory error:", error);
    res.status(500).json({ error: "Failed to get sensor history" });
  }
};

/* =========================================================
   GET SENSOR TREND (5 JAM, AVG PER JAM)
   ========================================================= */
exports.getSensorTrend = async (req, res) => {
  try {
    /* =====================================================
       1. Ambil AVG per jam (maks 5 jam terakhir)
       ===================================================== */
    const [avgRows] = await db.query(`
      SELECT
        sd.sensor_name,
        DATE_FORMAT(sd.collected_at, '%Y-%m-%d %H:00:00') AS hour_bucket,
        AVG(sd.value) AS avg_value
      FROM sensor_data sd
      WHERE sd.collected_at >= NOW() - INTERVAL 5 HOUR
      GROUP BY sd.sensor_name, hour_bucket
      ORDER BY sd.sensor_name, hour_bucket
    `);

    /* =====================================================
       2. Ambil nilai terakhir per sensor (snapshot)
       ===================================================== */
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

    // Mapping lastValue
    const lastValueMap = {};
    latestRows.forEach(row => {
      lastValueMap[row.sensor_name] = row.value;
    });

    /* =====================================================
       3. Ambil SEMUA sensor yang aktif dalam window 5 jam
          (walau baru punya 1 data)
       ===================================================== */
    const [activeSensors] = await db.query(`
      SELECT DISTINCT sensor_name
      FROM sensor_data
      WHERE collected_at >= NOW() - INTERVAL 5 HOUR
    `);

    /* =====================================================
       4. Inisialisasi sensorMap (WAJIB)
          -> ini kunci agar sensor muncul walau data minim
       ===================================================== */
    const sensorMap = {};

    activeSensors.forEach(s => {
      sensorMap[s.sensor_name] = {
        name: s.sensor_name,
        unit: "",
        lastValue: lastValueMap[s.sensor_name] ?? null,
        hourlyAvg: []
      };
    });

    /* =====================================================
       5. Isi hourlyAvg dari hasil AVG per jam
       ===================================================== */
    avgRows.forEach(row => {
      if (sensorMap[row.sensor_name]) {
        sensorMap[row.sensor_name].hourlyAvg.push(
          Number(row.avg_value.toFixed(2))
        );
      }
    });

    /* =====================================================
       6. Final response (urut Sensor 1, Sensor 2, ...)
       ===================================================== */
    const response = Object.values(sensorMap).sort((a, b) => {
      const aNum = parseInt(a.name.replace("Sensor ", ""), 10);
      const bNum = parseInt(b.name.replace("Sensor ", ""), 10);
      return aNum - bNum;
    });

    res.json(response);
  } catch (error) {
    console.error("getSensorTrend error:", error);
    res.status(500).json({ error: "Failed to get sensor trend" });
  }
};

