const API = "/api/sensors/status";

let rawSensorData = [];
let filteredSensorData = [];

const sensorBody = document.getElementById("sensorBody");
const sensorSummary = document.getElementById("sensorSummary");
const sensorResultCount = document.getElementById("sensorResultCount");
const lastSensorUpdate = document.getElementById("lastSensorUpdate");
const refreshSensors = document.getElementById("refreshSensors");

const locationFilter = document.getElementById("locationFilter");
const sensorFilter = document.getElementById("sensorFilter");
const statusFilter = document.getElementById("statusFilter");
const applySensorFilter = document.getElementById("applySensorFilter");
const resetSensorFilter = document.getElementById("resetSensorFilter");

function formatNow() {
  return new Date().toLocaleString("id-ID");
}

function renderSensorSummary(rows) {
  const totalSensors = rows.length;
  const activeCount = rows.filter((row) => row.online).length;
  const offlineCount = rows.filter((row) => !row.online).length;
  const locationCount = new Set(rows.map((row) => row.location)).size;

  sensorSummary.innerHTML = `
    <div class="summary-card">
      <p class="summary-card__label">Total Sensors</p>
      <h3 class="summary-card__value">${totalSensors}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Active</p>
      <h3 class="summary-card__value summary-card__value--success">${activeCount}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Offline</p>
      <h3 class="summary-card__value summary-card__value--danger">${offlineCount}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Locations</p>
      <h3 class="summary-card__value">${locationCount}</h3>
    </div>
  `;

  sensorResultCount.textContent = `${totalSensors} sensors`;
}

function renderSensorTable(rows) {
  if (!rows || rows.length === 0) {
    sensorBody.innerHTML = `
      <tr>
        <td colspan="3" class="table-empty">No sensor data found.</td>
      </tr>
    `;
    return;
  }

  sensorBody.innerHTML = rows
    .map((row) => {
      return `
        <tr>
          <td>${row.location}</td>
          <td><span class="sensor-name-badge">${row.sensor}</span></td>
          <td>
            <span class="sensor-status-pill ${row.online ? "sensor-status-pill--active" : "sensor-status-pill--offline"}">
              ${row.online ? "Active" : "Offline"}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function populateSensorFilters(rows) {
  const locations = [...new Set(rows.map((row) => row.location))];
  const sensors = [...new Set(rows.map((row) => row.sensor))];

  locationFilter.innerHTML = `
    <option value="">All locations</option>
    ${locations.map((item) => `<option value="${item}">${item}</option>`).join("")}
  `;

  sensorFilter.innerHTML = `
    <option value="">All sensors</option>
    ${sensors.map((item) => `<option value="${item}">${item}</option>`).join("")}
  `;
}

function applyFilters() {
  const selectedLocation = locationFilter.value;
  const selectedSensor = sensorFilter.value;
  const selectedStatus = statusFilter.value;

  filteredSensorData = rawSensorData.filter((row) => {
    const locationMatch = !selectedLocation || row.location === selectedLocation;
    const sensorMatch = !selectedSensor || row.sensor === selectedSensor;

    const statusValue = row.online ? "active" : "offline";
    const statusMatch = !selectedStatus || statusValue === selectedStatus;

    return locationMatch && sensorMatch && statusMatch;
  });

  renderSensorSummary(filteredSensorData);
  renderSensorTable(filteredSensorData);
}

async function loadSensors() {
  try {
    const res = await fetch(API);

    if (!res.ok) {
      throw new Error(`Failed to fetch sensors: ${res.status}`);
    }

    const data = await res.json();

    rawSensorData = Array.isArray(data) ? data : [];
    filteredSensorData = [...rawSensorData];

    populateSensorFilters(rawSensorData);
    applyFilters();

    lastSensorUpdate.textContent = formatNow();
  } catch (error) {
    console.error("Sensor load error:", error);

    sensorBody.innerHTML = `
      <tr>
        <td colspan="3" class="table-empty">Failed to load sensor data.</td>
      </tr>
    `;
  }
}

function resetFilters() {
  locationFilter.value = "";
  sensorFilter.value = "";
  statusFilter.value = "";

  filteredSensorData = [...rawSensorData];
  renderSensorSummary(filteredSensorData);
  renderSensorTable(filteredSensorData);
}

if (applySensorFilter) {
  applySensorFilter.addEventListener("click", applyFilters);
}

if (resetSensorFilter) {
  resetSensorFilter.addEventListener("click", resetFilters);
}

if (refreshSensors) {
  refreshSensors.addEventListener("click", loadSensors);
}

document.addEventListener("DOMContentLoaded", () => {
  loadSensors();
  setInterval(loadSensors, 15000);
});