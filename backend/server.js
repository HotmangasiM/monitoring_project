require("dotenv").config();

const app = require("./app");
const startSheetScheduler = require("./src/jobs/sheetScheduler");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    startSheetScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

startServer();
