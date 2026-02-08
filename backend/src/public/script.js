const API_BASE = "/api";

// simpan chart agar tidak double render
const charts = new Map();

// lock supaya loadDashboard tidak tabrakan
let loading = false;

/* =============================
   LOAD DASHBOARD (SNAPSHOT + TREND)
============================= */
async function loadDashboard() {
  if (loading) return; // ⛔ cegah double render
  loading = true;

  try {
    const [snapRes, trendRes] = await Promise.all([
      fetch(`${API_BASE}/dashboard`),
      fetch(`${API_BASE}/dashboard/trend`)
    ]);

    if (!snapRes.ok || !trendRes.ok) {
      throw new Error("API error");
    }

    const snapshot = await snapRes.json();
    const trends = await trendRes.json();

    console.log("Snapshot:", snapshot);
    console.log("Trends:", trends);

    const container = document.getElementById("dashboard");
    if (!container) return;

    // destroy semua chart lama sebelum clear DOM
    charts.forEach(chart => chart.destroy());
    charts.clear();

    container.innerHTML = "";

    snapshot.forEach(loc => {
      const section = document.createElement("section");

      section.innerHTML = `
        <h2 class="location-title">${loc.location}</h2>
        <div class="sensor-grid"></div>
      `;

      const grid = section.querySelector(".sensor-grid");

      loc.sensors.forEach(sensor => {
        const trendValues = getTrendValues(
          trends,
          loc.location,
          sensor.code
        );

        grid.appendChild(
          renderSensorCard(sensor, trendValues, loc.location)
        );
      });

      container.appendChild(section);
    });

    document.getElementById("lastUpdate").innerText =
      "Last update: " + new Date().toLocaleString();

  } catch (err) {
    console.error("Failed load dashboard:", err);
  }

  loading = false; // unlock
}

/* =============================
   AMBIL DATA TREND PER SENSOR
============================= */
function getTrendValues(trends, location, sensorCode) {
  if (!Array.isArray(trends)) return [];

  const loc = trends.find(l => l.location === location);
  if (!loc) return [];

  const sensor = loc.sensors.find(s => s.code === sensorCode);
  return sensor ? sensor.values : [];
}

/* =============================
   RENDER SENSOR CARD
============================= */
function renderSensorCard(sensor, trendValues, locationName) {
  const card = document.createElement("div");
  card.className = "sensor-card";

  // 🔥 ID stabil
  const canvasId = `${locationName}-${sensor.code}`
    .replace(/\s/g, "_");

  card.innerHTML = `
    <div class="card-header">
      <h3>${sensor.name}</h3>
      <span class="badge ${badgeClass(sensor.status.severity)}">
        ${sensor.status.label}
      </span>
    </div>

    <div class="chart-wrapper">
      <canvas id="${canvasId}"></canvas>
    </div>

    <div class="card-footer">
      Nilai terakhir:
      <strong>${sensor.value} ${sensor.unit}</strong>
    </div>
  `;

  setTimeout(() => {
    if (Array.isArray(trendValues) && trendValues.length >= 1) {
      renderChart(canvasId, trendValues, sensor.unit);
    }
  });

  return card;
}


/* =============================
   RENDER CHART
============================= */
function renderChart(canvasId, values) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // destroy chart lama jika ada
  if (charts.has(canvasId)) {
    charts.get(canvasId).destroy();
    charts.delete(canvasId);
  }

  const labels = values.map(
    (_, i) => `H-${values.length - i}`
  );

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: "#43A047",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });

  charts.set(canvasId, chart);
}

/* =============================
   BADGE COLOR
============================= */
function badgeClass(severity) {
  switch (severity) {
    case "NORMAL": return "badge-success";
    case "WARNING": return "badge-warning";
    case "DANGER": return "badge-danger";
    default: return "badge-off";
  }
}

/* =============================
   AUTO REFRESH
============================= */
setInterval(loadDashboard, 20000);

/* =============================
   INIT
============================= */
loadDashboard();
