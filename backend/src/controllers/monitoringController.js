const service = require("../service/monitoringService");

exports.getMonitoring = async(req, res, next) => {
    try {
        const { from, to } = req.query;
        if(!from || !to){
            return res.status(400).json({ error: "Missing Range" });
        }
        const data = await service.getMonitoringData(from, to);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

exports.exportCSV = async (req, res, next) => {
    try {
        const {from, to} = req.query;

        const csv = await service.getMonitoringCSV(from, to);

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