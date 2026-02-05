const axios = require("axios");

const URL =
  "https://docs.google.com/spreadsheets/d/1-cSPpjALHvvOqb2mgbkmDB0PZz0sBGk2/export?format=csv";

(async () => {
  try {
    const res = await axios.get(URL, { timeout: 20000 });
    console.log("Sheet OK, size:", res.data.length);
  } catch (err) {
    console.error("Sheet FAIL:", err.code, err.message);
  }
})();
