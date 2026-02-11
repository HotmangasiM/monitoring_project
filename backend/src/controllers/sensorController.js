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

    const data = await service.getSensorHistory(sensor, Number(limit));
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
