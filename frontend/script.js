const API_BASE = "http://localhost:3000/api";

let chart = null;
let activeSensor = null;

/* =========================
   LOAD LATEST SENSOR VALUE
   ========================= */
async function loadLatest() {
  const res = await fetch(`${API_BASE}/sensors/latest`);
  const data = await res.json();
  if (!data || data.length === 0) return;

  document.getElementById("lastUpdate").innerText =
    "Last update: " + new Date(data[0].collected_at).toLocaleString();

  // Sort Sensor 1, Sensor 2, ...
  data.sort((a, b) => {
    const na = parseInt(a.sensor_name.replace("Sensor ", ""));
    const nb = parseInt(b.sensor_name.replace("Sensor ", ""));
    return na - nb;
  });

  const container = document.getElementById("sensorCards");
  container.innerHTML = "";

  data.forEach(sensor => {
    const card = document.createElement("div");
    card.className = "card";

    if (sensor.sensor_name === activeSensor) {
      card.classList.add("active");
    }

    card.innerHTML = `
      <h3>${sensor.sensor_name}</h3>
      <div class="value">${sensor.value}</div>
    `;

    // 👉 CLICK CARD = LOAD CHART
    card.onclick = () => {
      activeSensor = sensor.sensor_name;
      loadTrend(sensor.sensor_name);
      loadLatest();
    };

    container.appendChild(card);
  });
}

/* =========================
   LOAD TREND FOR 1 SENSOR
   ========================= */
async function loadTrend(sensorName) {
  const res = await fetch(
    `${API_BASE}/sensors/history?sensor=${encodeURIComponent(sensorName)}&limit=60`
  );
  const data = await res.json();
  if (!data || data.length === 0) return;

  const labels = data.map(d =>
    new Date(d.collected_at).toLocaleTimeString()
  );
  const values = data.map(d => d.value);

  document.getElementById("chartTitle").innerText =
    `Trend ${sensorName}`;

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: sensorName,
        data: values,
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Sensor Value"
          }
        },
        x: {
          title: {
            display: true,
            text: "Time"
          }
        }
      }
    }
  });
}

/* =========================
   AUTO REFRESH
   ========================= */
setInterval(() => {
  loadLatest();
  if (activeSensor) {
    loadTrend(activeSensor);
  }
}, 20000);

/* =========================
   INITIAL LOAD
   ========================= */
loadLatest();
