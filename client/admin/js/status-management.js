// ============================================
// STATUS MANAGEMENT.JS — PhilTMS Admin
// ============================================

const applicationsDB = [
  { trn: 'TRN-2024-001', name: 'Juan Dela Cruz',  registrationDate: '2024-01-15', status: 'verified',     currentStep: 2 },
  { trn: 'TRN-2024-002', name: 'Maria Santos',     registrationDate: '2024-01-20', status: 'printed',      currentStep: 4 },
  { trn: 'TRN-2024-003', name: 'Carlos Reyes',     registrationDate: '2024-02-01', status: 'registered',   currentStep: 1 },
  { trn: 'TRN-2024-004', name: 'Rosa Garcia',      registrationDate: '2024-02-10', status: 'delivered',    currentStep: 6 },
  { trn: 'TRN-2024-005', name: 'Pedro Bautista',   registrationDate: '2024-02-15', status: 'for delivery', currentStep: 5 },
  { trn: 'TRN-2024-006', name: 'Liza Aquino',      registrationDate: '2024-03-01', status: 'for printing', currentStep: 3 },
];

const statusToStep = {
  'registered':   1,
  'verified':     2,
  'for printing': 3,
  'printed':      4,
  'for delivery': 5,
  'delivered':    6,
};

const stepToStatus = {
  1: 'registered',
  2: 'verified',
  3: 'for printing',
  4: 'printed',
  5: 'for delivery',
  6: 'delivered',
};

const BADGE_CLASS = {
  'registered':   'badge-registered',
  'verified':     'badge-verified',
  'for printing': 'badge-printing',
  'printed':      'badge-printed',
  'for delivery': 'badge-delivery',
  'delivered':    'badge-delivered',
};

let currentApplication = null;

/* ── SIDEBAR ── */
function toggleSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('mobileSidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  hamburger?.classList.toggle('active');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('hidden');
}

/* ── SEARCH ── */
function searchTRN() {
  const input      = document.getElementById('trnSearch');
  const searchTerm = input.value.trim().toUpperCase();

  if (!searchTerm) {
    showAlert('Please enter a Transaction Reference Number.', 'error');
    return;
  }

  const result = applicationsDB.find(app => app.trn === searchTerm);

  if (result) {
    currentApplication = result;
    displaySearchResult(result);
    displayWorkflow(result.currentStep);
    showUpdateSection();
  } else {
    currentApplication = null;
    document.getElementById('searchResult').classList.add('hidden');
    document.getElementById('updateSection').classList.add('hidden');
    showAlert(`No application found for TRN: ${searchTerm}`, 'warning');
  }
}

/* ── DISPLAY RESULT ── */
function displaySearchResult(app) {
  document.getElementById('resTRN').textContent    = app.trn;
  document.getElementById('resName').textContent   = app.name;
  document.getElementById('resDate').textContent   = formatDate(app.registrationDate);

  const statusEl = document.getElementById('resStatus');
  statusEl.innerHTML = `<span class="badge ${BADGE_CLASS[app.status] || ''}">${capitalizeStatus(app.status)}</span>`;

  document.getElementById('searchResult').classList.remove('hidden');
}

/* ── WORKFLOW ── */
function displayWorkflow(currentStep) {
  const steps      = document.querySelectorAll('.workflow-step');
  const connectors = document.querySelectorAll('.workflow-connector');

  steps.forEach(step => {
    const n = parseInt(step.dataset.step);
    step.classList.remove('active', 'done');
    if (n === currentStep) step.classList.add('active');
    else if (n < currentStep) step.classList.add('done');
  });

  // Colour the connector lines that are "done"
  connectors.forEach((conn, i) => {
    // connector index i sits between step i+1 and step i+2
    conn.classList.toggle('done', i + 1 < currentStep);
  });
}

/* ── UPDATE SECTION ── */
function showUpdateSection() {
  document.getElementById('updateSection').classList.remove('hidden');
  document.getElementById('newStatus').value = '';
  document.getElementById('updateSuccess').classList.add('hidden');
}

/* ── APPLY UPDATE ── */
function applyStatusUpdate() {
  const newStatus = document.getElementById('newStatus').value;

  if (!newStatus) {
    showAlert('Please select a new status.', 'error');
    return;
  }

  if (!currentApplication) {
    showAlert('No application selected.', 'error');
    return;
  }

  const newStep = statusToStep[newStatus];

  if (newStep < currentApplication.currentStep) {
    showAlert('Cannot revert to a previous status.', 'error');
    return;
  }

  if (newStep === currentApplication.currentStep) {
    showAlert('Application is already at this status.', 'warning');
    return;
  }

  // Update data
  currentApplication.status      = newStatus;
  currentApplication.currentStep = newStep;
  const idx = applicationsDB.findIndex(a => a.trn === currentApplication.trn);
  if (idx > -1) {
    applicationsDB[idx].status      = newStatus;
    applicationsDB[idx].currentStep = newStep;
  }

  // Refresh UI
  displayWorkflow(newStep);
  displaySearchResult(currentApplication);

  // Show success
  const success = document.getElementById('updateSuccess');
  success.classList.remove('hidden');
  setTimeout(() => success.classList.add('hidden'), 3500);

  document.getElementById('newStatus').value = '';
}

/* ── ALERT ── */
function showAlert(message, type = 'info') {
  // Remove any existing alert first
  document.querySelectorAll('.sm-alert').forEach(a => a.remove());

  const colors = {
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  };

  const c   = colors[type] || colors.info;
  const el  = document.createElement('div');
  el.className = 'sm-alert';
  el.style.cssText = `
    display:flex;align-items:center;gap:10px;
    margin-bottom:16px;padding:11px 16px;
    background:${c.bg};border:1.5px solid ${c.border};
    color:${c.text};border-radius:10px;
    font-size:13.5px;font-weight:600;
    animation:fadeSlideIn .2s ease;
  `;
  el.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      ${type === 'error'
        ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        : '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'}
    </svg>
    ${message}
  `;

  const searchCard = document.querySelector('.content-card');
  if (searchCard) searchCard.before(el);

  setTimeout(() => el.remove(), 4000);
}

/* ── HELPERS ── */
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalizeStatus(s) {
  return s?.replace(/\b\w/g, l => l.toUpperCase()) || s;
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Enter key on search
  document.getElementById('trnSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchTRN();
  });

  // Sidebar link closes sidebar
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('mobileSidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.add('hidden');
      document.getElementById('hamburger')?.classList.remove('active');
    });
  });
});