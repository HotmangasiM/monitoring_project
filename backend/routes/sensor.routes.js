const express = require('express');
const router = express.Router();
const controller = require('../controllers/sensor.controllers.js');

router.get('/sensors/latest', controller.getLatestSnapshot);
router.get('/sensors/history', controller.getSensorHistory);

router.get("/sensors/trend", controller.getSensorTrend);

module.exports = router;