// ============================================
// APPLICATIONS.JS — PhilTMS Admin
// Fetches real application data from API
// ============================================

let APPS = []; // Will be populated from API

const BADGE = {
  'registered':   'badge-registered',
  'verified':     'badge-verified',
  'for printing': 'badge-printing',
  'printed':      'badge-printed',
  'for delivery': 'badge-delivery',
  'delivered':    'badge-delivered',
};

const STATUS_ORDER = ['registered', 'verified', 'for printing', 'printed', 'for delivery', 'delivered'];

const PAGE_SIZE = 8;
let currentPage   = 1;
let currentFilter = 'all';
let currentQuery  = '';
let selectedApp   = null;

/* ── API FUNCTIONS ── */
async function loadApplicationsFromAPI() {
  try {
    const session = window.PhilTmsAuth?.getSession?.();
    if (!session?.accessToken) {
      showToast('Not authenticated');
      return;
    }

    const response = await fetch('/admin/applications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    APPS = result.data || [];
    renderTable();
  } catch (error) {
    console.error('Failed to load applications:', error);
    showToast('Failed to load applications');
    // Fallback to empty array
    APPS = [];
    renderTable();
  }
}

async function updateApplicationStatusAPI(applicationId, newStatus) {
  try {
    const session = window.PhilTmsAuth?.getSession?.();
    if (!session?.accessToken) {
      showToast('Not authenticated');
      return false;
    }

    const response = await fetch(`/admin/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to update status:', error);
    showToast('Failed to update status');
    return false;
  }
}

/* ── FILTERING ── */
function getFiltered() {
  return APPS.filter(a => {
    const matchFilter = currentFilter === 'all' || a.status === currentFilter;
    const matchQuery  = !currentQuery
      || a.trn.toLowerCase().includes(currentQuery)
      || a.name.toLowerCase().includes(currentQuery);
    return matchFilter && matchQuery;
  });
}

/* ── RENDER TABLE ── */
function renderTable() {
  const filtered   = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const tbody = document.getElementById('appTableBody');

  // Update counts
  document.getElementById('resultCount').textContent =
    `Showing ${slice.length} of ${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
  document.getElementById('totalBadge').textContent =
    `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = slice.map(a => `
    <tr>
      <td><code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px">${a.trn || 'N/A'}</code></td>
      <td style="font-weight:500">${a.name}</td>
      <td style="color:#64748b">${a.date}</td>
      <td><span class="badge ${BADGE[a.status] || ''}">${formatStatus(a.status)}</span></td>
      <td><button class="view-link" onclick="openDetail('${a.application_id}')">View Details →</button></td>
    </tr>
  `).join('') || `
    <tr>
      <td colspan="5" style="text-align:center;padding:32px;color:#94a3b8;font-size:14px">
        No applications found.
      </td>
    </tr>
  `;

  renderPagination(totalPages);
}

/* ── PAGINATION ── */
function renderPagination(total) {
  const pg = document.getElementById('pagination');
  if (total <= 1) { pg.innerHTML = ''; return; }
  pg.innerHTML = Array.from({ length: total }, (_, i) => i + 1)
    .map(i => `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`)
    .join('');
}

function goPage(n) { currentPage = n; renderTable(); }

/* ── FILTER / SEARCH ── */
function setFilter(val, btn) {
  currentFilter = val;
  currentPage   = 1;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

function filterTable(q) {
  currentQuery = q.toLowerCase().trim();
  currentPage  = 1;
  renderTable();
}

/* ── HELPERS ── */
function formatStatus(s) {
  return s?.replace(/\b\w/g, l => l.toUpperCase()) || s;
}

/* ── MODAL ── */
function openDetail(applicationId) {
  selectedApp = APPS.find(a => a.application_id === applicationId);
  if (!selectedApp) return;

  const isLast = STATUS_ORDER.indexOf(selectedApp.status) >= STATUS_ORDER.length - 1;

  document.getElementById('modalBody').innerHTML = `
    <div class="detail-row">
      <span class="detail-label">TRN</span>
      <span class="detail-value">
        <code style="font-size:13px;background:#f1f5f9;padding:2px 8px;border-radius:5px">${selectedApp.trn || 'N/A'}</code>
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Applicant Name</span>
      <span class="detail-value">${selectedApp.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Registration Date</span>
      <span class="detail-value">${selectedApp.date}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Current Status</span>
      <span class="detail-value">
        <span class="badge ${BADGE[selectedApp.status] || ''}">${formatStatus(selectedApp.status)}</span>
      </span>
    </div>
    ${isLast ? `<p style="margin:16px 0 0;font-size:12.5px;color:#94a3b8;text-align:center">This application has already been delivered.</p>` : ''}
  `;

  // Disable advance button if already delivered
  const advBtn = document.querySelector('.modal-footer .btn-primary');
  if (advBtn) {
    advBtn.disabled = isLast;
    advBtn.style.opacity = isLast ? '0.45' : '1';
    advBtn.style.cursor  = isLast ? 'not-allowed' : 'pointer';
  }

  document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('detailModal').classList.add('hidden');
  selectedApp = null;
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('detailModal')) closeModal();
}

/* ── ADVANCE STATUS ── */
async function updateStatus() {
  if (!selectedApp) return;
  const idx = STATUS_ORDER.indexOf(selectedApp.status);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) return;

  const newStatus = STATUS_ORDER[idx + 1];
  
  // Update via API
  const success = await updateApplicationStatusAPI(selectedApp.application_id, newStatus);
  if (!success) return;

  // Update local state
  selectedApp.status = newStatus;
  const appIdx = APPS.findIndex(a => a.application_id === selectedApp.application_id);
  if (appIdx > -1) APPS[appIdx].status = newStatus;

  closeModal();
  renderTable();
  showToast(`Status advanced to "${formatStatus(selectedApp.status)}"`);
}

/* ── TOAST ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

/* ── SIDEBAR ── */
function toggleSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('mobileSidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  hamburger.classList.toggle('active');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('hidden');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  loadApplicationsFromAPI();
});