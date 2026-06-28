const service = require("../service/sensorService");

exports.getLatestSnapshot = async (req, res, next) => {
  try {
    const data = await service.getLatestSnapshot();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getSensorHistory = async (req, res, next) => {
  try {
    const { sensor, limit = 50 } = req.query;

    if (!sensor) {
      return res.status(400).json({ error: "sensor query is required" });
    }

    const parsedLimit = Number(limit);

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
      return res.status(400).json({ error: "limit must be an integer between 1 and 500" });
    }

    const data = await service.getSensorHistory(String(sensor).toUpperCase(), parsedLimit);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getSensorTrend = async (req, res, next) => {
  try {
    const data = await service.getSensorTrend();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getSensorStatus = async (req, res, next) => {
  try {
    const data = await service.getSensorStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
};
