// ============================================
// APPLICATIONS.JS — PhilTMS Admin
// ============================================

const APPS = [
  { trn: 'TRN-2024-001234', name: 'Maria Santos',      date: '2025-01-10', status: 'for delivery' },
  { trn: 'TRN-2024-001235', name: 'Juan Dela Cruz',    date: '2025-01-12', status: 'printed' },
  { trn: 'TRN-2024-001236', name: 'Ana Reyes',         date: '2025-01-20', status: 'for printing' },
  { trn: 'TRN-2024-001237', name: 'Pedro Garcia',      date: '2025-01-22', status: 'verified' },
  { trn: 'TRN-2024-001238', name: 'Sofia Martinez',    date: '2025-01-20', status: 'registered' },
  { trn: 'TRN-2024-001239', name: 'Carlos Lopez',      date: '2025-01-21', status: 'delivered' },
  { trn: 'TRN-2024-001240', name: 'Rosa Fernandez',    date: '2025-01-23', status: 'verified' },
  { trn: 'TRN-2024-001241', name: 'Miguel Torres',     date: '2025-01-25', status: 'for delivery' },
  { trn: 'TRN-2024-001242', name: 'Linda Ramos',       date: '2025-01-26', status: 'delivered' },
  { trn: 'TRN-2024-001243', name: 'Antonio Cruz',      date: '2025-01-28', status: 'registered' },
  { trn: 'TRN-2024-001244', name: 'Carmen Villanueva', date: '2025-01-29', status: 'printed' },
  { trn: 'TRN-2024-001245', name: 'Ramon Aquino',      date: '2025-01-30', status: 'for printing' },
  { trn: 'TRN-2024-001246', name: 'Liza Pascual',      date: '2025-02-01', status: 'verified' },
  { trn: 'TRN-2024-001247', name: 'Eduardo Bautista',  date: '2025-02-02', status: 'delivered' },
  { trn: 'TRN-2024-001248', name: 'Nena Castillo',     date: '2025-02-03', status: 'for delivery' },
];

const BADGE = {
  'registered':   'badge-registered',
  'verified':     'badge-verified',
  'for printing': 'badge-printing',
  'printed':      'badge-printed',
  'for delivery': 'badge-delivery',
  'delivered':    'badge-delivered',
};

const PAGE_SIZE = 8;
let currentPage = 1;
let currentFilter = 'all';
let currentQuery = '';
let selectedApp = null;

function getFiltered() {
  return APPS.filter(a => {
    const matchFilter = currentFilter === 'all' || a.status === currentFilter;
    const matchQuery = !currentQuery
      || a.trn.toLowerCase().includes(currentQuery)
      || a.name.toLowerCase().includes(currentQuery);
    return matchFilter && matchQuery;
  });
}

function renderTable() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tbody = document.getElementById('appTableBody');
  tbody.innerHTML = slice.map(a => `
    <tr>
      <td>${a.trn}</td>
      <td>${a.name}</td>
      <td>${a.date}</td>
      <td><span class="badge ${BADGE[a.status] || ''}">${formatStatus(a.status)}</span></td>
      <td><button class="view-link" onclick="openDetail('${a.trn}')">View Details →</button></td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">No applications found.</td></tr>';

  renderPagination(totalPages);
}

function renderPagination(total) {
  const pg = document.getElementById('pagination');
  if (total <= 1) { pg.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  pg.innerHTML = html;
}

function goPage(n) { currentPage = n; renderTable(); }

function setFilter(val, btn) {
  currentFilter = val;
  currentPage = 1;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

function filterTable(q) {
  currentQuery = q.toLowerCase();
  currentPage = 1;
  renderTable();
}

function formatStatus(s) { return s?.replace(/\b\w/g, l => l.toUpperCase()) || s; }

function openDetail(trn) {
  selectedApp = APPS.find(a => a.trn === trn);
  if (!selectedApp) return;
  document.getElementById('modalBody').innerHTML = `
    <div style="display:grid;gap:12px">
      <div class="result-row" style="display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12.5px;font-weight:600;color:var(--text-muted);min-width:140px">TRN</span><span style="font-size:13.5px;font-weight:500">${selectedApp.trn}</span></div>
      <div class="result-row" style="display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12.5px;font-weight:600;color:var(--text-muted);min-width:140px">Applicant Name</span><span style="font-size:13.5px;font-weight:500">${selectedApp.name}</span></div>
      <div class="result-row" style="display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12.5px;font-weight:600;color:var(--text-muted);min-width:140px">Registration Date</span><span style="font-size:13.5px;font-weight:500">${selectedApp.date}</span></div>
      <div class="result-row" style="display:flex;gap:12px;align-items:center;padding:8px 0"><span style="font-size:12.5px;font-weight:600;color:var(--text-muted);min-width:140px">Current Status</span><span class="badge ${BADGE[selectedApp.status] || ''}">${formatStatus(selectedApp.status)}</span></div>
    </div>
  `;
  document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('detailModal').classList.add('hidden');
  selectedApp = null;
}

function updateStatus() {
  if (!selectedApp) return;
  const statuses = ['registered','verified','for printing','printed','for delivery','delivered'];
  const idx = statuses.indexOf(selectedApp.status);
  if (idx < statuses.length - 1) {
    selectedApp.status = statuses[idx + 1];
    const appIdx = APPS.findIndex(a => a.trn === selectedApp.trn);
    if (appIdx > -1) APPS[appIdx].status = selectedApp.status;
  }
  closeModal();
  renderTable();
}

function toggleSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('hidden');
}

document.addEventListener('DOMContentLoaded', renderTable);