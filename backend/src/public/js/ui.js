function getBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "normal") return "badge badge--success";
  if (normalized === "warning" || normalized === "medium" || normalized === "low") {
    return "badge badge--warning";
  }
  if (normalized === "high" || normalized === "critical" || normalized === "danger") {
    return "badge badge--danger";
  }

  return "badge badge--neutral";
}

function formatStatusText(status) {
  if (!status) return "-";
  const raw = String(status).toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatLastUpdate(date = new Date()) {
  return date.toLocaleString("id-ID");
}

function formatTrendLabel(dateTimeString) {
  if (!dateTimeString) return "-";

  const date = new Date(dateTimeString.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return dateTimeString;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}