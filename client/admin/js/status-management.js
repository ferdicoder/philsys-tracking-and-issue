/* ============================================
   STATUS MANAGEMENT - JavaScript
   Handles search, workflow updates, and status management
   ============================================ */

// Mock database for demonstration
const applicationsDB = [
  {
    trn: 'TRN-2024-001',
    name: 'Juan Dela Cruz',
    registrationDate: '2024-01-15',
    status: 'verified',
    currentStep: 2
  },
  {
    trn: 'TRN-2024-002',
    name: 'Maria Santos',
    registrationDate: '2024-01-20',
    status: 'printed',
    currentStep: 4
  },
  {
    trn: 'TRN-2024-003',
    name: 'Carlos Reyes',
    registrationDate: '2024-02-01',
    status: 'registered',
    currentStep: 1
  },
  {
    trn: 'TRN-2024-004',
    name: 'Rosa Garcia',
    registrationDate: '2024-02-10',
    status: 'delivered',
    currentStep: 6
  }
];

// Map status to step number
const statusToStep = {
  'registered': 1,
  'verified': 2,
  'for printing': 3,
  'printed': 4,
  'for delivery': 5,
  'delivered': 6
};

// Map step number to status
const stepToStatus = {
  1: 'registered',
  2: 'verified',
  3: 'for printing',
  4: 'printed',
  5: 'for delivery',
  6: 'delivered'
};

// Global variable to track current application
let currentApplication = null;

/**
 * Toggle sidebar on mobile
 */
function toggleSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('hidden');
  }
}

/**
 * Search for application by TRN
 */
function searchTRN() {
  const searchInput = document.getElementById('trnSearch');
  const searchTerm = searchInput.value.trim().toUpperCase();

  // Validation
  if (!searchTerm) {
    showAlert('Please enter a Transaction Reference Number', 'error');
    return;
  }

  // Search in database
  const result = applicationsDB.find(app => app.trn === searchTerm);

  if (result) {
    currentApplication = result;
    displaySearchResult(result);
    displayWorkflow(result.currentStep);
    showUpdateSection();
  } else {
    currentApplication = null;
    clearSearchResult();
    hideUpdateSection();
    showAlert(`No application found with TRN: ${searchTerm}`, 'warning');
  }
}

/**
 * Display search result
 */
function displaySearchResult(application) {
  const searchResult = document.getElementById('searchResult');
  
  if (searchResult) {
    document.getElementById('resTRN').textContent = application.trn;
    document.getElementById('resName').textContent = application.name;
    document.getElementById('resDate').textContent = formatDate(application.registrationDate);
    document.getElementById('resStatus').textContent = capitalizeStatus(application.status);
    
    searchResult.classList.remove('hidden');
  }
}

/**
 * Clear search result display
 */
function clearSearchResult() {
  const searchResult = document.getElementById('searchResult');
  if (searchResult) {
    searchResult.classList.add('hidden');
  }
}

/**
 * Display workflow with current step highlighted
 */
function displayWorkflow(currentStep) {
  const workflowSteps = document.querySelectorAll('.workflow-step');
  
  workflowSteps.forEach(step => {
    const stepNumber = parseInt(step.getAttribute('data-step'));
    
    // Remove all classes
    step.classList.remove('active', 'done');
    
    // Add appropriate class
    if (stepNumber === currentStep) {
      step.classList.add('active');
    } else if (stepNumber < currentStep) {
      step.classList.add('done');
    }
  });
}

/**
 * Show update section
 */
function showUpdateSection() {
  const updateSection = document.getElementById('updateSection');
  if (updateSection) {
    updateSection.classList.remove('hidden');
  }
}

/**
 * Hide update section
 */
function hideUpdateSection() {
  const updateSection = document.getElementById('updateSection');
  if (updateSection) {
    updateSection.classList.add('hidden');
  }
}

/**
 * Apply status update
 */
function applyStatusUpdate() {
  const newStatusSelect = document.getElementById('newStatus');
  const newStatus = newStatusSelect.value;

  // Validation
  if (!newStatus) {
    showAlert('Please select a new status', 'error');
    return;
  }

  if (!currentApplication) {
    showAlert('No application selected', 'error');
    return;
  }

  // Get new step number
  const newStep = statusToStep[newStatus];
  
  // Validate: can only move to next step or same step
  if (newStep < currentApplication.currentStep) {
    showAlert('Cannot move to a previous status', 'error');
    return;
  }

  // Update in database (mock)
  currentApplication.status = newStatus;
  currentApplication.currentStep = newStep;

  // Update UI
  displayWorkflow(newStep);
  document.getElementById('resStatus').textContent = capitalizeStatus(newStatus);

  // Show success message
  showInlineSuccess();

  // Reset select
  newStatusSelect.value = '';
}

/**
 * Show inline success message
 */
function showInlineSuccess() {
  const successMsg = document.getElementById('updateSuccess');
  if (successMsg) {
    successMsg.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      successMsg.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Show alert notification
 */
function showAlert(message, type = 'info') {
  // Create alert element
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
      ${getAlertIcon(type)}
    </svg>
    <span>${message}</span>
  `;

  // Insert at top of main content
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    const pageHeader = mainContent.querySelector('.page-header');
    if (pageHeader) {
      pageHeader.after(alert);
    } else {
      mainContent.insertBefore(alert, mainContent.firstChild);
    }
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * Get SVG icon for alert type
 */
function getAlertIcon(type) {
  const icons = {
    error: '<circle cx="12" cy="12" r="1"/><path d="M12 7v5M12 17h.01"/>',
    warning: '<path d="M12 2L2 20h20L12 2z" stroke="currentColor" stroke-width="2" fill="none"/>',
    success: '<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  return icons[type] || '';
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Capitalize status text
 */
function capitalizeStatus(status) {
  return status
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Allow Enter key to search
 */
document.addEventListener('DOMContentLoaded', function() {
  const trnSearch = document.getElementById('trnSearch');
  if (trnSearch) {
    trnSearch.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        searchTRN();
      }
    });
  }

  // Close sidebar when clicking on a link
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const sidebar = document.getElementById('mobileSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar) sidebar.classList.remove('active');
      if (overlay) overlay.classList.add('hidden');
    });
  });
});
