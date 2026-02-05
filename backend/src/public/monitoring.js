const API = "/api/monitoring";

document.getElementById("applyFilter")
  .addEventListener("click", loadData);

document.getElementById("downloadCSV")
  .addEventListener("click", downloadCSV);

async function loadData() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  if (!from || !to) {
    alert("Please select date range");
    return;
  }

  const res = await fetch(
    `${API}?from=${from}&to=${to}`
  );

  const data = await res.json();

  const tbody = document.getElementById("resultBody");
  tbody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.location}</td>
      <td>${row.sensor}</td>
      <td>${row.hour}</td>
      <td>${row.avg}</td>
    `;

    tbody.appendChild(tr);
  });
}

function downloadCSV() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  window.location =
    `${API}/export?from=${from}&to=${to}`;
}
