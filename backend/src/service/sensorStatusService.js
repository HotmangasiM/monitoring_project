function getSensorStatus(code, value) {
  if (value === null || value === undefined) {
    return "UNKNOWN";
  }

  switch (code) {
    case "TEMP":
      if (value < 18) return "LOW";
      if (value > 30) return "HIGH";
      return "NORMAL";

    case "HUM":
      if (value < 40) return "LOW";
      if (value > 80) return "HIGH";
      return "NORMAL";

    case "TDS":
      if (value > 1200) return "HIGH";
      return "NORMAL";

    case "PH":
      if (value < 6.5) return "LOW";
      if (value > 8.5) return "HIGH";
      return "NORMAL";

    default:
      return "NORMAL";
  }
}

module.exports = {
  getSensorStatus
};
