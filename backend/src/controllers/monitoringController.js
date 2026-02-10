const service = require("../service/monitoringService");
const { fromWIBtoUTC } = require("../utils/time");

exports.getMonitoring = async(req, res, next) => {
    try {
        const { from, to } = req.query;
        if(!from || !to){
            return res.status(400).json({ error: "Missing Range" });
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
        const fromUTC = fromWIBtoUTC(from);
        const toUTC = fromWIBtoUTC(to);

        const csv = await service.getMonitoringCSV(fromUTC, toUTC);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; file=monitoring.csv"
        );
        res.send(csv);
    } catch (error) {
        next(error);
    }
}