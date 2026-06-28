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
        return [
            escapeCSV(r.location),
            escapeCSV(r.sensor),
            escapeCSV(hourWIB),
            escapeCSV(r.avg)
        ].join(",");
    }).join("\n");

    return header + body;
}

function escapeCSV(value) {
    const text = value === null || value === undefined ? "" : String(value);

    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

module.exports = {
    getMonitoringData,
    getMonitoringCSV
} 
