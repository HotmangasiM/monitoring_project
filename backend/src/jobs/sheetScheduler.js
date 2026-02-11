const cron = require("node-cron");
const { importSheetSnapshot } =
  require("../service/sheetImportService");

let running = false;

function startSheetScheduler() {
  cron.schedule("*/20 * * * * *", async () => {
    if (running) {
      console.log("⏳ Skip — previous job still running");
      return;
    }

    running = true;

    try {
      await importSheetSnapshot();
    } finally {
      running = false;
    }
  });
}

module.exports = startSheetScheduler;
