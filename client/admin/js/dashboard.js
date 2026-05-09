/**
 * PhilTMS Dashboard
 * Handles sidebar navigation, table filtering, and animated counters
 */

// ============================================
// SIDEBAR TOGGLE FUNCTIONALITY
// ============================================

/**
 * Toggle the mobile sidebar visibility
 */
function toggleSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle('active');
  overlay.classList.toggle('hidden');
  hamburger.classList.toggle('active');
}

// Close sidebar when a link is clicked
document.addEventListener('DOMContentLoaded', function () {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', toggleSidebar);
  });
});

// ============================================
// TABLE FILTERING FUNCTIONALITY
// ============================================

/**
 * Filter dashboard applications table by TRN or applicant name
 * @param {string} searchValue - The search term
 */
function filterDashTable(searchValue) {
  const table = document.getElementById('dashAppTable');
  if (!table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr:not([data-empty-row="true"])');
  const searchTerm = searchValue.toLowerCase().trim();

  rows.forEach(row => {
    const trn = row.cells[0]?.textContent.toLowerCase() || '';
    const applicantName = row.cells[1]?.textContent.toLowerCase() || '';

    const matches = trn.includes(searchTerm) || applicantName.includes(searchTerm);

    row.style.display = matches ? '' : 'none';
  });

  const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
  const emptyRow = tbody.querySelector('tr[data-empty-row="true"]');

  if (visibleRows.length === 0 && searchTerm.length > 0) {
    if (!emptyRow) {
      tbody.appendChild(createEmptyRow(5, 'No matching applications found.'));
    }
  } else if (emptyRow) {
    emptyRow.remove();
  }
}

// ============================================
// DASHBOARD DATA WIRING
// ============================================

const FALLBACK_DASHBOARD_DATA = {
  summary: {
    totalApplications: 2847,
    processing: 456,
    delivered: 2145,
    pendingReports: 28,
    resolvedReports: 142,
  },
  recentActivity: [
    {
      trn: 'TRN-2024-001234',
      applicantName: 'Maria Santos',
      activity: 'Status updated to For Delivery',
      date: '2025-02-25, 14:32',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001235',
      applicantName: 'Juan Dela Cruz',
      activity: 'Status updated to Printed',
      date: '2025-02-25, 14:19',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001236',
      applicantName: 'Ana Reyes',
      activity: 'Status updated to For Printing',
      date: '2025-02-25, 11:45',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001237',
      applicantName: 'Pedro Garcia',
      activity: 'Application verified',
      date: '2025-02-25, 10:22',
      updatedBy: 'Admin User',
    },
    {
      trn: 'TRN-2024-001238',
      applicantName: 'Sofia Martinez',
      activity: 'New applicant registered',
      date: '2025-02-25, 09:10',
      updatedBy: 'System',
    },
    {
      trn: 'TRN-2024-001239',
      applicantName: 'Carlos Lopez',
      activity: 'Status updated to Delivered',
      date: '2025-02-25, 08:30',
      updatedBy: 'Admin User',
    },
  ],
  applications: [
    {
      trn: 'TRN-2024-001234',
      applicantName: 'Maria Santos',
      registrationDate: '2025-01-10',
      status: 'For Delivery',
    },
    {
      trn: 'TRN-2024-001235',
      applicantName: 'Juan Dela Cruz',
      registrationDate: '2025-01-12',
      status: 'Printed',
    },
    {
      trn: 'TRN-2024-001236',
      applicantName: 'Ana Reyes',
      registrationDate: '2025-01-20',
      status: 'For Printing',
    },
    {
      trn: 'TRN-2024-001237',
      applicantName: 'Pedro Garcia',
      registrationDate: '2025-01-22',
      status: 'Verified',
    },
    {
      trn: 'TRN-2024-001238',
      applicantName: 'Sofia Martinez',
      registrationDate: '2025-01-20',
      status: 'Registered',
    },
    {
      trn: 'TRN-2024-001239',
      applicantName: 'Carlos Lopez',
      registrationDate: '2025-01-21',
      status: 'Delivered',
    },
  ],
};

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (window.PhilTmsAuth && typeof window.PhilTmsAuth.getSession === 'function') {
    const session = window.PhilTmsAuth.getSession();
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }
  return headers;
}

async function fetchDashboardData() {
  try {
    const response = await fetch('/dashboard', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      return FALLBACK_DASHBOARD_DATA;
    }

    return data;
  } catch (error) {
    return FALLBACK_DASHBOARD_DATA;
  }
}

function renderSummary(summary) {
  const valueElements = document.querySelectorAll('.summary-value[data-key]');
  valueElements.forEach(element => {
    const key = element.dataset.key;
    const value = Number(summary?.[key]) || 0;
    element.dataset.count = value;
    element.textContent = '0';
    element.classList.remove('animated');
  });

  initializeCounters();
}

function renderActivityTable(activities) {
  const tbody = document.getElementById('activityTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!activities?.length) {
    tbody.appendChild(createEmptyRow(5, 'No activity available yet.'));
    return;
  }

  activities.forEach(activity => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${activity.trn}</td>
      <td>${activity.applicantName}</td>
      <td>${activity.activity}</td>
      <td>${activity.date}</td>
      <td>${activity.updatedBy}</td>
    `;
    tbody.appendChild(row);
  });
}

function getStatusBadgeClass(status) {
  const normalized = String(status || '').toLowerCase();

  if (normalized.includes('delivery')) return 'badge-delivery';
  if (normalized.includes('printed')) return 'badge-printed';
  if (normalized.includes('printing')) return 'badge-printing';
  if (normalized.includes('verified')) return 'badge-verified';
  if (normalized.includes('registered')) return 'badge-registered';
  if (normalized.includes('delivered')) return 'badge-delivered';

  return 'badge-registered';
}

function renderApplicationsTable(applications) {
  const tbody = document.getElementById('dashAppTableBody')
    || document.querySelector('#dashAppTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!applications?.length) {
    tbody.appendChild(createEmptyRow(5, 'No applications found.'));
    return;
  }

  applications.forEach(application => {
    const statusClass = getStatusBadgeClass(application.status);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${application.trn}</td>
      <td>${application.applicantName}</td>
      <td>${application.registrationDate}</td>
      <td><span class="badge ${statusClass}">${application.status}</span></td>
      <td><a href="applications.html" class="view-link">View Details →</a></td>
    `;
    tbody.appendChild(row);
  });

  const searchInput = document.getElementById('dashSearch');
  if (searchInput?.value?.trim()) {
    filterDashTable(searchInput.value);
  }
}

function createEmptyRow(columnCount, message) {
  const row = document.createElement('tr');
  row.dataset.emptyRow = 'true';
  const cell = document.createElement('td');
  cell.colSpan = columnCount;
  cell.textContent = message;
  row.appendChild(cell);
  return row;
}

// ============================================
// ANIMATED COUNTER FUNCTIONALITY
// ============================================

/**
 * Animate number counter from 0 to target value
 * @param {HTMLElement} element - The element to animate
 * @param {number} target - The target number
 * @param {number} duration - Duration in milliseconds (default: 2000)
 */
function animateCounter(element, target, duration = 2000) {
  const startValue = 0;
  const startTime = Date.now();

  function updateCounter() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuad);

    element.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  updateCounter();
}

/**
 * Initialize all summary card counters
 */
function initializeCounters() {
  const summaryCards = document.querySelectorAll('.summary-card');

  summaryCards.forEach(card => {
    const valueElement = card.querySelector('.summary-value');
    if (!valueElement) return;

    const targetValue = parseInt(valueElement.dataset.count) || 0;

    // Trigger animation when element comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !valueElement.classList.contains('animated')) {
          animateCounter(valueElement, targetValue);
          valueElement.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(card);
  });
}

// ============================================
// ACTIVE NAV LINK HIGHLIGHTING
// ============================================

/**
 * Highlight the current active navigation link based on URL
 */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || href === `${currentPage}.html`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  // Load dashboard data before initializing counters
  fetchDashboardData()
    .then(data => {
      renderSummary(data.summary);
      renderActivityTable(data.recentActivity);
      renderApplicationsTable(data.applications);
    })
    .catch(() => {
      renderSummary(FALLBACK_DASHBOARD_DATA.summary);
      renderActivityTable(FALLBACK_DASHBOARD_DATA.recentActivity);
      renderApplicationsTable(FALLBACK_DASHBOARD_DATA.applications);
    });

  // Set active nav link
  setActiveNavLink();

  // Add keyboard shortcut to close sidebar (ESC key)
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      const sidebar = document.getElementById('mobileSidebar');
      if (sidebar && sidebar.classList.contains('active')) {
        toggleSidebar();
      }
    }
  });

  // Search bar input event listener
  const searchInput = document.getElementById('dashSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filterDashTable(this.value);
    });

    // Clear button functionality (if needed)
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        filterDashTable('');
      }
    });
  }

  // Add smooth scroll behavior for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format number to readable format with commas
 * @param {number} num - The number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get all table data for export purposes
 * @param {string} tableId - The table element ID
 * @returns {Array} - Array of table data
 */
function getTableData(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return [];

  const data = [];
  const rows = table.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const rowData = Array.from(row.cells).map(cell => cell.textContent.trim());
    data.push(rowData);
  });

  return data;
}

/**
 * Refresh dashboard data (can be called periodically)
 */
function refreshDashboardData() {
  // This function can be expanded to fetch fresh data from the API
  console.log('Refreshing dashboard data...');

  // Example: Could call an API endpoint to fetch updated stats
  // fetch('/api/dashboard/stats')
  //   .then(response => response.json())
  //   .then(data => updateDashboardUI(data))
  //   .catch(error => console.error('Error refreshing data:', error));
}

/**
 * Set up auto-refresh interval (optional)
 * @param {number} intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
 */
function setupAutoRefresh(intervalMs = 60000) {
  setInterval(refreshDashboardData, intervalMs);
}

// Optional: Uncomment to enable auto-refresh every 5 minutes
// setupAutoRefresh(300000);
