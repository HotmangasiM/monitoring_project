const repo = require("../repositories/monitoringRepository");

async function getMonitoringData(from, to) {
    const rows = await repo.getMonitoringRange(from, to);
    return rows;
}

async function getMonitoringCSV(from, to) {
    const rows = await repo.getMonitoringRange(from, to);

    const header = "Location,Sensor,Hour,Average\n";

    const body = rows.map(r =>
        `${r.location},${r.sensor},${r.hour},${r.avg}`
    ).join("\n");

    return header + body;
}

module.exports = {
    getMonitoringData,
    getMonitoringCSV
} 