require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const sensorRoutes = require('./routes/sensor.routes.js');
const startSheetScheduler = require('./jobs/sheetScheduler.js');

const app = express();

app.use(cors());
app.use(express.json());

//API ROUTES
app.use('/api', sensorRoutes);

// serve frontend static
app.use(express.static(path.join(__dirname, "public")));

//START BABCKGROUND SCHEDULER
startSheetScheduler();

// PORT WAJIB seperti ini
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});