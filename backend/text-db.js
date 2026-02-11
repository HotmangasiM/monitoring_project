require("dotenv").config();
const db = require("./src/config/db");

(async () => {
  try {
    const [rows] = await db.query("SELECT NOW()");
    console.log("DB OK:", rows);
  } catch (err) {
    console.error("DB FAIL:", err);
  }
})();
