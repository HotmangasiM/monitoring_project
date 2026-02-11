const API = "/api/sensors/status";

async function loadSensors() {
  const res = await fetch(API);
  const data = await res.json();

  const tbody = document.getElementById("sensorBody");
  tbody.innerHTML = "";

  data.forEach(s => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${s.location}</td>
      <td>${s.sensor}</td>
      <td>
        <span class="sensor-status ${s.online ? "active" : "offline"}">
          ${s.online ? "Active" : "Offline"}
        </span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// load awal
loadSensors();

// auto refresh 15 detik
setInterval(loadSensors, 15000);
