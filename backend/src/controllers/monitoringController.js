const service = require("../service/monitoringService");
const { fromWIBtoUTC } = require("../utils/time");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

const DATE_FORMATS = [
    "YYYY-MM-DDTHH:mm",
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DD HH:mm:ss"
];

function parseDate(value) {
    return dayjs(String(value), DATE_FORMATS, true);
}

function validateDateRange(from, to) {
    if (!from || !to) {
        return "Missing Range";
    }

    const fromDate = parseDate(from);
    const toDate = parseDate(to);

    if (!fromDate.isValid() || !toDate.isValid()) {
        return "Invalid date range";
    }

    if (fromDate.isAfter(toDate)) {
        return "From date must be before or equal to to date";
    }

    return null;
}

exports.getMonitoring = async(req, res, next) => {
    try {
        const { from, to } = req.query;
        const validationError = validateDateRange(from, to);

        if(validationError){
            return res.status(400).json({ error: validationError });
        }

        const fromUTC = fromWIBtoUTC(from);
        const toUTC = fromWIBtoUTC(to);

        const data = await service.getMonitoringData(fromUTC, toUTC);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.exportCSV = async (req, res, next) => {
    try {
        const {from, to} = req.query;
        const validationError = validateDateRange(from, to);

        if(validationError){
            return res.status(400).json({ error: validationError });
        }

        const fromUTC = fromWIBtoUTC(from);
        const toUTC = fromWIBtoUTC(to);

        const csv = await service.getMonitoringCSV(fromUTC, toUTC);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=\"monitoring.csv\""
        );
        res.send(csv);
    } catch (error) {
        next(error);
    }
}
