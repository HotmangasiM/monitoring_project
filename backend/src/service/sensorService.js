const repo = require("../repositories/sensorRepository");

/* Latest */
async function getLatestSnapshot() {
  return repo.getLatestSnapshot();
}

/* History */
async function getSensorHistory(sensor, limit) {
  const rows = await repo.getSensorHistory(sensor, limit);
  return rows.reverse();
}

/* Trend */
async function getSensorTrend() {
  const avgRows = await repo.getHourlyAvg();
  const latestRows = await repo.getLatestValues();
  const activeSensors = await repo.getActiveSensors();

  const lastValueMap = {};
  latestRows.forEach(r => {
    lastValueMap[r.sensor_name] = r.value;
  });

  const sensorMap = {};

  activeSensors.forEach(s => {
    sensorMap[s.sensor_name] = {
      name: s.sensor_name,
      unit: "",
      lastValue: lastValueMap[s.sensor_name] ?? null,
      hourlyAvg: []
    };
  });

  avgRows.forEach(row => {
    if (sensorMap[row.sensor_name]) {
      sensorMap[row.sensor_name].hourlyAvg.push(
        Number(row.avg_value.toFixed(2))
      );
    }
  });

  return Object.values(sensorMap).sort((a, b) => {
    const aNum = parseInt(a.name.replace("Sensor ", ""), 10);
    const bNum = parseInt(b.name.replace("Sensor ", ""), 10);
    return aNum - bNum;
  });
}

async function getSensorStatus() {
  const rows = await repo.getLastSeen();

  const now = new Date();

  return rows.map(r => {
    const last = new Date(r.last_seen);

    const diffMinutes =
      (now - last) / 60000;

    return {
      location: r.location,
      sensor: r.sensor,
      online: diffMinutes < 10 // kasih toleransi
    };
  });
}

module.exports = {
  getLatestSnapshot,
  getSensorHistory,
  getSensorTrend,
  getSensorStatus
};
