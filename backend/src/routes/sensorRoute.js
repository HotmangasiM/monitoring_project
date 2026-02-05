const express = require('express');
const router = express.Router();

const sensorController = require("../controllers/sensorController");

// SENSOR
router.get("/latest", sensorController.getLatestSnapshot);
router.get("/history", sensorController.getSensorHistory);
router.get("/trend", sensorController.getSensorTrend);

module.exports = router;