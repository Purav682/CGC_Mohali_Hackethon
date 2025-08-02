// Check if user is logged in
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) window.location.href = 'login.html';
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// Chart initialization
let attackChart;

// Fetch and display attacks
async function fetchAttacks() {
  const { data: attacks, error } = await supabase
    .from('sql_attacks')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);

  if (!error) {
    updateDashboard(attacks);
    updateChart(attacks);
  }
}
// Add this function to fetch scan results
async function scanWebsite(url) {
  try {
    const response = await fetch(`http://localhost:5000/scan/${encodeURIComponent(url)}`);
    const data = await response.json();
    console.log("Scan results:", data);
    return data;
  } catch (error) {
    console.error("Scan failed:", error);
  }
}

// Example usage - add this to your dashboard.js
document.getElementById('scanBtn').addEventListener('click', async () => {
  const url = document.getElementById('websiteUrl').value;
  const results = await scanWebsite(url);
  updateDashboard(results.attacks);
});
function updateDashboard(attacks) {
  // Update stats
  document.getElementById('totalAttacks').textContent = attacks.length;
  document.getElementById('highSeverity').textContent = 
    attacks.filter(a => a.severity === 'high').length;

  // Update attack table
  const tbody = document.querySelector('#attacksTable tbody');
  tbody.innerHTML = '';

  attacks.slice(0, 10).forEach(attack => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(attack.timestamp).toLocaleTimeString()}</td>
      <td>${attack.ip_address}</td>
      <td class="payload">${attack.payload.substring(0, 30)}...</td>
      <td class="severity ${attack.severity}">${attack.severity}</td>
    `;
    tbody.appendChild(row);
  });
}

function updateChart(attacks) {
  const ctx = document.getElementById('attackChart').getContext('2d');
  
  // Group attacks by hour
  const hours = Array(24).fill(0);
  attacks.forEach(attack => {
    const hour = new Date(attack.timestamp).getHours();
    hours[hour]++;
  });

  if (attackChart) attackChart.destroy();

  attackChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Attacks per hour',
        data: hours,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }]
    }
  });
}

// Initial data load
fetchAttacks();

// Real-time updates
supabase
  .channel('attacks')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sql_attacks'
  }, () => fetchAttacks())
  .subscribe();