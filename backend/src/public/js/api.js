async function fetchDashboardSummary() {
  const response = await fetch("/api/dashboard");

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
  }

  return response.json();
}

async function fetchDashboardTrend() {
  const response = await fetch("/api/dashboard/trend");

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard trend: ${response.status}`);
  }

  return response.json();
}

async function getMonitoringData(from, to) {
  const params = new URLSearchParams({
    from,
    to,
  });

  const response = await fetch(`/api/monitoring?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch monitoring data: ${response.status}`);
  }

  return response.json();
}

function downloadMonitoringCSV(from, to) {
  const params = new URLSearchParams({
    from,
    to,
  });

  window.open(`/api/monitoring/export?${params.toString()}`, "_blank");
}