/* =========================================================
   CONFIG
   ========================================================= */
const API_BASE = "/api"; // ✅ FIX: HARUS /api
const REFRESH_INTERVAL = 20000; // 20 detik
const HOUR_LABELS = ["H-5", "H-4", "H-3", "H-2", "H-1"];

// simpan instance chart per sensor
const charts = new Map();

/* =========================================================
   UTILITIES
   ========================================================= */
function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function getStatusBadge(value) {
  if (value === null || value === undefined) {
    return `<span class="badge badge-off">N/A</span>`;
  }
  if (value < 20) {
    return `<span class="badge badge-danger">Rendah</span>`;
  }
  if (value < 60) {
    return `<span class="badge badge-success">Normal</span>`;
  }
  return `<span class="badge badge-warning">Tinggi</span>`;
}

/* =========================================================
   RENDER SENSOR GRID
   ========================================================= */
function renderSensors(sensors) {
  const container = document.getElementById("sensorCards");
  container.innerHTML = "";

  sensors.forEach(sensor => {
    const canvasId = `chart-${sensor.name.replace(/\s+/g, "-")}`;

    const card = document.createElement("div");
    card.className = "sensor-card";

    card.innerHTML = `
      <div class="card-header">
        <h3>${sensor.name}</h3>
        ${getStatusBadge(sensor.lastValue)}
      </div>

      <p class="card-subtitle">
        Rata-rata per jam (5 jam terakhir)
      </p>

      <div class="chart-wrapper">
        <canvas id="${canvasId}" height="140"></canvas>
      </div>

      <div class="card-footer">
        Nilai terakhir:
        <strong>${sensor.lastValue ?? "-"} ${sensor.unit ?? ""}</strong>
      </div>
    `;

    container.appendChild(card);

    renderChart(
      canvasId,
      HOUR_LABELS.slice(-sensor.hourlyAvg.length),
      sensor.hourlyAvg,
      sensor.unit
    );
  });
}

/* =========================================================
   CHART.JS
   ========================================================= */
function renderChart(canvasId, labels, data, unit) {
  const ctx = document.getElementById(canvasId);

  // destroy chart lama kalau ada
  if (charts.has(canvasId)) {
    charts.get(canvasId).destroy();
  }

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: "#43A047",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#43A047",
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y} ${unit ?? ""}`
          }
        }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });

  charts.set(canvasId, chart);
}

/* =========================================================
   LOAD SENSOR TREND (MAIN DASHBOARD)
   ========================================================= */
async function loadSensorTrend() {
  try {
    const res = await fetch(`${API_BASE}/sensors/trend`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById("sensorCards").innerHTML =
        "<p>Tidak ada data sensor</p>";
      return;
    }

    // sort Sensor 1, Sensor 2, ...
    data.sort((a, b) => {
      const na = parseInt(a.name.replace("Sensor ", ""), 10);
      const nb = parseInt(b.name.replace("Sensor ", ""), 10);
      return na - nb;
    });

    renderSensors(data);

    // update waktu terakhir (pakai waktu sekarang)
    document.getElementById("lastUpdate").innerText =
      "Last update: " + new Date().toLocaleString();

  } catch (err) {
    console.error("Failed to load sensor trend:", err);
  }
}

/* =========================================================
   AUTO REFRESH
   ========================================================= */
setInterval(loadSensorTrend, REFRESH_INTERVAL);

/* =========================================================
   INITIAL LOAD
   ========================================================= */
loadSensorTrend();
