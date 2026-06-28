let rawData = [];
let filteredData = [];

let sortState = {
  key: null,
  asc: true,
};

const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const locationFilter = document.getElementById("locationFilter");
const sensorFilter = document.getElementById("sensorFilter");

const applyFilterButton = document.getElementById("applyFilter");
const resetFilterButton = document.getElementById("resetFilter");
const downloadCSVButton = document.getElementById("downloadCSV");

const resultBody = document.getElementById("resultBody");
const monitoringSummary = document.getElementById("monitoringSummary");
const resultCountText = document.getElementById("resultCountText");
const lastQueryText = document.getElementById("lastQueryText");

const sortLocation = document.getElementById("sortLocation");
const sortSensor = document.getElementById("sortSensor");
const sortHour = document.getElementById("sortHour");

function setDefaultDateRange() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  fromInput.value = formatForDateTimeLocal(oneHourAgo);
  toInput.value = formatForDateTimeLocal(now);
}

function formatForDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function formatDateDisplay(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID");
}

function populateLocalFilters(rows) {
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

function applyLocalFilters() {
  const selectedLocation = locationFilter.value;
  const selectedSensor = sensorFilter.value;

  filteredData = rawData.filter((row) => {
    const locationMatch = !selectedLocation || row.location === selectedLocation;
    const sensorMatch = !selectedSensor || row.sensor === selectedSensor;

    return locationMatch && sensorMatch;
  });

  if (sortState.key) {
    sortCurrentData();
  }

  renderSummary(filteredData);
  renderTable(filteredData);
}

function renderSummary(rows) {
  const totalRecords = rows.length;
  const totalLocations = new Set(rows.map((row) => row.location)).size;
  const totalSensors = new Set(rows.map((row) => row.sensor)).size;

  const from = fromInput.value;
  const to = toInput.value;
  const selectedRange =
    from && to
      ? `${formatDateDisplay(from)} - ${formatDateDisplay(to)}`
      : "-";

  monitoringSummary.innerHTML = `
    <div class="summary-card">
      <p class="summary-card__label">Total Records</p>
      <h3 class="summary-card__value">${totalRecords}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Locations</p>
      <h3 class="summary-card__value">${totalLocations}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Sensors</p>
      <h3 class="summary-card__value">${totalSensors}</h3>
    </div>
    <div class="summary-card">
      <p class="summary-card__label">Selected Range</p>
      <h3 class="summary-card__value summary-card__value--small">${selectedRange}</h3>
    </div>
  `;

  resultCountText.textContent = `${totalRecords} records`;
}

function renderTable(rows) {
  if (!rows || rows.length === 0) {
    resultBody.innerHTML = `
      <tr>
        <td colspan="4" class="table-empty">No monitoring data found for the selected range.</td>
      </tr>
    `;
    return;
  }

  resultBody.innerHTML = rows
    .map((row) => {
      return `
        <tr>
          <td>${row.location}</td>
          <td><span class="sensor-badge">${row.sensor}</span></td>
          <td>${row.hour}</td>
          <td>${row.avg}</td>
        </tr>
      `;
    })
    .join("");
}

function sortCurrentData() {
  filteredData.sort((a, b) => {
    let v1 = a[sortState.key];
    let v2 = b[sortState.key];

    if (sortState.key === "hour") {
      v1 = new Date(v1);
      v2 = new Date(v2);
    } else {
      v1 = String(v1).toLowerCase();
      v2 = String(v2).toLowerCase();
    }

    if (v1 > v2) return sortState.asc ? 1 : -1;
    if (v1 < v2) return sortState.asc ? -1 : 1;
    return 0;
  });
}

function sortTable(key, thElement) {
  if (sortState.key === key) {
    sortState.asc = !sortState.asc;
  } else {
    sortState.key = key;
    sortState.asc = true;
  }

  sortCurrentData();
  updateSortUI(thElement);
  renderTable(filteredData);
}

function updateSortUI(activeTh) {
  document.querySelectorAll(".sortable").forEach((th) => {
    th.classList.remove("active");
    th.querySelector(".sort-indicator").textContent = "↕";
  });

  activeTh.classList.add("active");
  activeTh.querySelector(".sort-indicator").textContent = sortState.asc ? "↑" : "↓";
}

async function loadData() {
  try {
    const from = fromInput.value;
    const to = toInput.value;

    if (!from || !to) {
      alert("Please select date range");
      return;
    }

    rawData = await getMonitoringData(from, to);
    filteredData = [...rawData];

    populateLocalFilters(rawData);
    applyLocalFilters();

    lastQueryText.textContent = new Date().toLocaleString("id-ID");
  } catch (error) {
    console.error("Monitoring load error:", error);

    resultBody.innerHTML = `
      <tr>
        <td colspan="4" class="table-empty">Failed to load monitoring data.</td>
      </tr>
    `;
  }
}

function handleDownload() {
  const from = fromInput.value;
  const to = toInput.value;

  if (!from || !to) {
    alert("Please select date range");
    return;
  }

  downloadMonitoringCSV(from, to);
}

function handleReset() {
  setDefaultDateRange();

  locationFilter.innerHTML = `<option value="">All locations</option>`;
  sensorFilter.innerHTML = `<option value="">All sensors</option>`;

  rawData = [];
  filteredData = [];
  sortState = { key: null, asc: true };

  document.querySelectorAll(".sortable").forEach((th) => {
    th.classList.remove("active");
    th.querySelector(".sort-indicator").textContent = "↕";
  });

  renderSummary([]);
  renderTable([]);
  resultCountText.textContent = "0 records";
  lastQueryText.textContent = "-";
}

applyFilterButton.addEventListener("click", loadData);
downloadCSVButton.addEventListener("click", handleDownload);
resetFilterButton.addEventListener("click", handleReset);

locationFilter.addEventListener("change", applyLocalFilters);
sensorFilter.addEventListener("change", applyLocalFilters);

sortLocation.addEventListener("click", () => sortTable("location", sortLocation));
sortSensor.addEventListener("click", () => sortTable("sensor", sortSensor));
sortHour.addEventListener("click", () => sortTable("hour", sortHour));

document.addEventListener("DOMContentLoaded", () => {
  setDefaultDateRange();
  renderSummary([]);
  renderTable([]);
});