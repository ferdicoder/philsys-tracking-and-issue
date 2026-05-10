/* ============================================
   PHILTMS — DASHBOARD JS
   ============================================ */

/* ------------------------------------------
   SIDEBAR TOGGLE (Mobile)
------------------------------------------ */
function toggleSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('mobileSidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  hamburger.classList.toggle('active');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('hidden');
}

/* ------------------------------------------
   ANIMATED COUNTERS (Summary Cards)
------------------------------------------ */
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 1200;
  const step     = Math.ceil(target / (duration / 16));
  let   current  = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString();
  }, 16);
}

function initCounters() {
  document.querySelectorAll('.summary-value[data-count]').forEach(el => {
    animateCounter(el);
  });
}

/* ------------------------------------------
   SEARCH FILTER (Applications Table)
------------------------------------------ */
function filterDashTable(query) {
  const q    = query.toLowerCase().trim();
  const rows = document.querySelectorAll('#dashAppTable tbody tr');

  rows.forEach(row => {
    const trn  = row.cells[0]?.textContent.toLowerCase() ?? '';
    const name = row.cells[1]?.textContent.toLowerCase() ?? '';
    row.style.display = (!q || trn.includes(q) || name.includes(q)) ? '' : 'none';
  });
}

/* ------------------------------------------
   ACTIVE NAV LINK (highlight current page)
------------------------------------------ */
function setActiveNav() {
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    link.classList.toggle('active', href === current);
  });
}

/* ------------------------------------------
   INIT
------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  setActiveNav();
});