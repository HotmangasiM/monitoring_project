const repo = require("../repositories/dashboardRepository");
const { getSensorStatus } = require("./sensorStatusService");

async function getDashboardData() {
  const rows = await repo.getLatestDashboardSnapshot();

  const map = {};

  rows.forEach(row => {
    if (!map[row.location_id]) {
      map[row.location_id] = {
        location: row.location_name,
        sensors: []
      };
    }

    const statusRaw = getSensorStatus(
      row.sensor_code,
      row.value
    );

    const status = {
      severity: statusRaw,
      label: statusRaw
    };

    map[row.location_id].sensors.push({
      code: row.sensor_code,
      name: row.sensor_name,
      value: row.value,
      unit: row.unit,
      status
    });
  });

  return Object.values(map);
}

async function getDashboardTrend() {
  const rows = await repo.getDashboardTrend();
  const map = {};

  rows.forEach(row => {
    if (!map[row.location_id]) {
      map[row.location_id] = {
        location: row.location_name,
        sensors: {}
      };
    }

    if (!map[row.location_id].sensors[row.sensor_code]) {
      map[row.location_id].sensors[row.sensor_code] = {
        code: row.sensor_code,
        values: []
      };
    }

    map[row.location_id].sensors[row.sensor_code]
      .values.push(Number(Number(row.avg_value).toFixed(1)));
  });

  return Object.values(map).map(loc => ({
    location: loc.location,
    sensors: Object.values(loc.sensors)
  }));
}


module.exports = {
  getDashboardData,
  getDashboardTrend
};
