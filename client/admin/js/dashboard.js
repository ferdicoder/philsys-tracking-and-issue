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

  const rows = tbody.querySelectorAll('tr');
  const searchTerm = searchValue.toLowerCase().trim();

  rows.forEach(row => {
    const trn = row.cells[0]?.textContent.toLowerCase() || '';
    const applicantName = row.cells[1]?.textContent.toLowerCase() || '';

    const matches = trn.includes(searchTerm) || applicantName.includes(searchTerm);

    row.style.display = matches ? '' : 'none';
  });

  // Show "no results" message if needed
  const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
  if (visibleRows.length === 0 && searchTerm.length > 0) {
    console.log('No matching results found');
  }
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
  // Initialize all counters when DOM is ready
  initializeCounters();

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
