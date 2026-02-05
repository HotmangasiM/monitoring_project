const express = require("express");
const router = express.Router();

const monitoringController = require("../controllers/monitoringController");
const exportController = require("../controllers/monitoringExportController");
const ctrl = require("../controllers/monitoringController");

router.get("/", ctrl.getMonitoring);
router.get("/export", ctrl.exportCSV);

module.exports = router;