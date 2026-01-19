const express = require('express');
const cors = require('cors');
const sensorRoutes = require('./routes/sensor.routes.js');
const startSheetScheduler = require('./jobs/sheetScheduler.js');

const app = express();
app.use(cors());
app.use('/api', sensorRoutes);
const port = 3000;

//START BABCKGROUND SCHEDULER
startSheetScheduler();

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});