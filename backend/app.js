const express = require("express");
const cors = require("cors");
const path = require("path");

const sensorRoutes = require("./src/routes/sensorRoute");
const dashboardRoutes = require("./src/routes/dashboardRoute");
const monitoringRoutes = require("./src/routes/monitoringRoute");
const errorMiddleware = require("./src/middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/sensors", sensorRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/monitoring", monitoringRoutes);

app.use(errorMiddleware);

// static frontend
app.use(express.static(path.join(__dirname, "src/public")));

module.exports = app;
