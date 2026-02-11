const repo = require("../repositories/monitoringRepository");
const { toWIB } = require("../utils/time");

async function getMonitoringData(from, to) {
    const rows = await repo.getMonitoringRange(from, to);
    const result = rows.map(r => ({
        ...r,
        hour: toWIB(r.hour)
    }));
    return result;
}

async function getMonitoringCSV(from, to) {
    const rows = await repo.getMonitoringRange(from, to);

    const header = "Location,Sensor,Hour,Average\n";

    const body = rows.map(r => {
        const hourWIB = toWIB(r.hour);
        return `${r.location},${r.sensor},${hourWIB},${r.avg}`;
    }).join("\n");

    return header + body;
}

module.exports = {
    getMonitoringData,
    getMonitoringCSV
} 