const express = require("express");
const router = express.Router();

const monitoringController = require("../controllers/monitoringController");
const exportController = require("../controllers/monitoringExportController");

router.get("/data", monitoringController.getMonitoringData);
router.get("/export", exportController.exportMonitoringCSV);

module.exports = router;