const summaryGrid = document.getElementById("summaryGrid");
const locationsContainer = document.getElementById("locationsContainer");
const lastUpdateText = document.getElementById("lastUpdateText");
const refreshButton = document.getElementById("refreshButton");

const alertsSummary = document.getElementById("alertsSummary");
const alertsContainer = document.getElementById("alertsContainer");

const locationSelect = document.getElementById("locationSelect");
const sensorSelect = document.getElementById("sensorSelect");

let trendChartInstance = null;
let trendState = [];

console.log("dashboard.js loaded");

function calculateSummary(locations) {
  let totalSensors = 0;
  let normal = 0;
  let warning = 0;
  let critical = 0;

  locations.forEach((location) => {
    location.sensors.forEach((sensor) => {
      totalSensors += 1;

      const status = String(sensor.status?.severity || "").toLowerCase();

      if (status === "normal") {
        normal += 1;
      } else if (status === "warning" || status === "medium" || status === "low") {
        warning += 1;
      } else {
        critical += 1;
      }
    });
  });

  return {
    totalLocations: locations.length,
    totalSensors,
    normal,
    warning,
    critical,
  };
}

function renderSummary(summary) {
  summaryGrid.innerHTML = `
    <div class="summary-card">
      <p class="summary-card__label">Total Locations</p>
      <h3 class="summary-card__value">${summary.totalLocations}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Total Sensors</p>
      <h3 class="summary-card__value">${summary.totalSensors}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Normal</p>
      <h3 class="summary-card__value summary-card__value--success">${summary.normal}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Warning</p>
      <h3 class="summary-card__value summary-card__value--warning">${summary.warning}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Critical</p>
      <h3 class="summary-card__value summary-card__value--danger">${summary.critical}</h3>
    </div>
  `;
}

function renderLocations(locations) {
  if (!locations || locations.length === 0) {
    locationsContainer.innerHTML = `<p class="empty-state">No locations found.</p>`;
    return;
  }

  locationsContainer.innerHTML = locations
    .map((location) => {
      const sensorsHtml = location.sensors
        .map((sensor) => {
          const statusText = sensor.status?.label || sensor.status?.severity || "-";
          const statusSeverity = sensor.status?.severity || sensor.status?.label || "";

          return `
            <div class="sensor-item">
              <div class="sensor-item__top">
                <p class="sensor-item__name">${sensor.name}</p>
                <span class="${getBadgeClass(statusSeverity)}">${formatStatusText(statusText)}</span>
              </div>
              <div>
                <span class="sensor-item__value">${sensor.value ?? "-"}</span>
                <span class="sensor-item__unit">${sensor.unit || ""}</span>
              </div>
              <p class="sensor-item__meta">Sensor code: ${sensor.code}</p>
            </div>
          `;
        })
        .join("");

      return `
        <div class="location-card">
          <div class="location-card__header">
            <h4 class="location-card__title">${location.location}</h4>
            <span class="badge badge--neutral">${location.sensors.length} sensors</span>
          </div>
          <div class="sensor-grid">
            ${sensorsHtml}
          </div>
        </div>
      `;
    })
    .join("");
}

function populateTrendFilters(trendData) {
  trendState = Array.isArray(trendData) ? trendData : [];

  if (!locationSelect || !sensorSelect) return;

  if (trendState.length === 0) {
    locationSelect.innerHTML = `<option value="">No locations</option>`;
    sensorSelect.innerHTML = `<option value="">No sensors</option>`;

    if (trendChartInstance) {
      trendChartInstance.destroy();
      trendChartInstance = null;
    }

    return;
  }

  locationSelect.innerHTML = trendState
    .map((location, index) => {
      return `<option value="${index}">${location.location}</option>`;
    })
    .join("");

  updateSensorOptions();
}

function updateSensorOptions() {
  const selectedLocationIndex = Number(locationSelect?.value || 0);
  const selectedLocation = trendState[selectedLocationIndex];

  if (!selectedLocation || !Array.isArray(selectedLocation.sensors)) {
    sensorSelect.innerHTML = `<option value="">No sensors</option>`;
    return;
  }

  sensorSelect.innerHTML = selectedLocation.sensors
    .map((sensor, index) => {
      return `<option value="${index}">${sensor.code}</option>`;
    })
    .join("");

  updateTrendChartBySelection();
}

function updateTrendChartBySelection() {
  const selectedLocationIndex = Number(locationSelect?.value || 0);
  const selectedSensorIndex = Number(sensorSelect?.value || 0);

  const selectedLocation = trendState[selectedLocationIndex];
  if (!selectedLocation) return;

  const selectedSensor = selectedLocation.sensors?.[selectedSensorIndex];
  if (!selectedSensor) return;

  renderTrendChart(selectedLocation, selectedSensor);
}

function renderTrendChart(location, sensor) {
  const canvas = document.getElementById("trendChart");
  if (!canvas) return;

  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not available; trend chart rendering skipped.");
    return;
  }

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  const values = Array.isArray(sensor.values) ? sensor.values : [];

  const labels = values.map((item) => formatTrendLabel(item.time));
  const datasetValues = values.map((item) => item.value);

  trendChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${location.location} - ${sensor.code}`,
          data: datasetValues,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#0f172a",
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#64748b",
            maxRotation: 25,
            minRotation: 25,
          },
          grid: {
            color: "rgba(148, 163, 184, 0.15)",
          },
        },
        y: {
          ticks: {
            color: "#64748b",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.15)",
          },
        },
      },
    },
  });
}

async function loadDashboard() {
  try {
    console.log("Loading dashboard data...");

    const locations = await fetchDashboardSummary();

    const summary = calculateSummary(locations);
    renderSummary(summary);
    renderLocations(locations);

    const alerts = buildAlerts(locations);
    renderAlertsSummary(alerts);
    renderAlerts(alerts);

    const trendData = await fetchDashboardTrend();
    console.log("Dashboard trend response:", trendData);

    populateTrendFilters(trendData);

    lastUpdateText.textContent = formatLastUpdate(new Date());
  } catch (error) {
    console.error("Dashboard load error:", error);
    locationsContainer.innerHTML = `<p class="empty-state">Failed to load dashboard data.</p>`;
  }
}

if (refreshButton) {
  refreshButton.addEventListener("click", loadDashboard);
}

if (locationSelect) {
  locationSelect.addEventListener("change", updateSensorOptions);
}

if (sensorSelect) {
  sensorSelect.addEventListener("change", updateTrendChartBySelection);
}

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  setInterval(loadDashboard, 20000);
});

function buildAlerts(locations) {
  const alerts = [];

  locations.forEach((location) => {
    location.sensors.forEach((sensor) => {
      const severity = String(sensor.status?.severity || "").toLowerCase();

      if (severity !== "normal") {
        alerts.push({
          location: location.location,
          sensorName: sensor.name,
          sensorCode: sensor.code,
          value: sensor.value,
          unit: sensor.unit,
          severity,
          label: sensor.status?.label || sensor.status?.severity || severity,
        });
      }
    });
  });

  return alerts;
}

function renderAlertsSummary(alerts) {
  if (!alertsSummary) return;

  const criticalCount = alerts.filter((item) =>
    ["high", "critical", "danger"].includes(item.severity)
  ).length;

  const warningCount = alerts.filter((item) =>
    ["low", "warning", "medium"].includes(item.severity)
  ).length;

  alertsSummary.innerHTML = `
    <div class="alert-stat">
      <span class="alert-stat__label">Total Alerts</span>
      <strong class="alert-stat__value">${alerts.length}</strong>
    </div>
    <div class="alert-stat">
      <span class="alert-stat__label">Critical</span>
      <strong class="alert-stat__value alert-stat__value--danger">${criticalCount}</strong>
    </div>
    <div class="alert-stat">
      <span class="alert-stat__label">Warning</span>
      <strong class="alert-stat__value alert-stat__value--warning">${warningCount}</strong>
    </div>
  `;
}

function renderAlerts(alerts) {
  if (!alertsContainer) return;

  if (!alerts || alerts.length === 0) {
    alertsContainer.innerHTML = `<p class="empty-state">No active alerts.</p>`;
    return;
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const rank = { high: 1, critical: 1, danger: 1, low: 2, warning: 2, medium: 2 };
    return (rank[a.severity] || 99) - (rank[b.severity] || 99);
  });

  alertsContainer.innerHTML = sortedAlerts
    .map((alert) => {
      const itemClass =
        ["high", "critical", "danger"].includes(alert.severity)
          ? "alert-item alert-item--danger"
          : "alert-item alert-item--warning";

      return `
        <div class="${itemClass}">
          <div class="alert-item__top">
            <div>
              <p class="alert-item__title">${alert.location} — ${alert.sensorName}</p>
              <p class="alert-item__meta">Sensor code: ${alert.sensorCode}</p>
            </div>
            <span class="${getBadgeClass(alert.severity)}">${formatStatusText(alert.label)}</span>
          </div>
          <p class="alert-item__value">Current value: ${alert.value} ${alert.unit || ""}</p>
        </div>
      `;
    })
    .join("");
}
