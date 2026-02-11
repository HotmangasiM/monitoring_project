const API = "/api/monitoring";

/* ============================= */
/* STATE */
/* ============================= */

let tableData = [];
let sortState = {
  key: null,
  asc: true
};

/* ============================= */
/* EVENT */
/* ============================= */

document.getElementById("applyFilter")
  .addEventListener("click", loadData);

document.getElementById("downloadCSV")
  .addEventListener("click", downloadCSV);

document.getElementById("sortLocation")
  .onclick = function () {
    sortTable("location", this);
  };

document.getElementById("sortSensor")
  .onclick = function () {
    sortTable("sensor", this);
  };

document.getElementById("sortHour")
  .onclick = function () {
    sortTable("hour", this);
  };

/* ============================= */
/* LOAD DATA */
/* ============================= */

async function loadData() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  if (!from || !to) {
    alert("Please select date range");
    return;
  }

  const res = await fetch(`${API}?from=${from}&to=${to}`);
  tableData = await res.json();

  renderTable(tableData);
}

/* ============================= */
/* RENDER TABLE */
/* ============================= */

function renderTable(rows) {
  const tbody = document.getElementById("resultBody");
  tbody.innerHTML = "";

  rows.forEach(row => {
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

/* ============================= */
/* SORTING */
/* ============================= */

function sortTable(key, thElement) {

  // toggle ASC / DESC
  if (sortState.key === key) {
    sortState.asc = !sortState.asc;
  } else {
    sortState.key = key;
    sortState.asc = true;
  }

  tableData.sort((a, b) => {
    let v1 = a[key];
    let v2 = b[key];

    if (key === "hour") {
      v1 = new Date(v1);
      v2 = new Date(v2);
    }

    return sortState.asc
      ? (v1 > v2 ? 1 : -1)
      : (v1 < v2 ? 1 : -1);
  });

  // reset semua header
  document.querySelectorAll(".sortable").forEach(th => {
    th.classList.remove("active");
    th.querySelector(".arrow").textContent = "unfold_more";
  });

  // aktifkan header yang diklik
  thElement.classList.add("active");

  const arrow = thElement.querySelector(".arrow");
  arrow.textContent = sortState.asc
    ? "arrow_upward"
    : "arrow_downward";

  renderTable(tableData);
}


/* ============================= */
/* DOWNLOAD CSV */
/* ============================= */

function downloadCSV() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  window.location = `${API}/export?from=${from}&to=${to}`;
}
