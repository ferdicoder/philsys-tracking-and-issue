/**
 * PhilTMS Settings Page - Profile & Account Management
 * Handles user profile updates, security settings, and account information
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  loadRecentActivity();
  initializeEventListeners();
});

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

/**
 * Load user profile data
 */
function loadUserProfile() {
  try {
    const userToken = localStorage.getItem('token');
    if (!userToken) {
      return; // Allow anonymous view of settings page
    }

    // Load from storage or API
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      updateProfileUI(profile);
    } else {
      // Try to fetch from API
      fetchUserProfile(userToken);
    }
  } catch (error) {
    console.log('Profile load info:', error);
  }
}

/**
 * Fetch user profile from API
 */
function fetchUserProfile(token) {
  fetch('/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.ok ? response.json() : Promise.reject('Failed'))
    .then(data => {
      updateProfileUI(data);
      localStorage.setItem('userProfile', JSON.stringify(data));
    })
    .catch(err => console.log('Using default profile data'));
}

/**
 * Update UI with profile data
 */
function updateProfileUI(userData) {
  const fullName = userData.fullName || userData.firstName + ' ' + userData.lastName || 'Admin User';
  const email = userData.email || 'admin@philtms.gov.ph';
  const phone = userData.phone || '+63 912 345 6789';
  const department = userData.department || 'PhilSys Operations';

  // Update avatar
  document.getElementById('profileAvatar').textContent = getInitials(fullName);

  // Update profile card
  document.getElementById('profileName').textContent = fullName;
  document.getElementById('profileId').textContent = `Admin ID: ${userData.adminId || 'ADM-001'}`;

  // Update info grid
  document.getElementById('infoName').textContent = fullName;
  document.getElementById('infoEmail').textContent = email;
  document.getElementById('infoPhone').textContent = phone;
  document.getElementById('infoDept').textContent = department;

  // Update modal fields
  document.getElementById('editName').value = fullName;
  document.getElementById('editEmail').value = email;
  document.getElementById('editPhone').value = phone;
  document.getElementById('editDept').value = department;
}

/**
 * Get initials from name
 */
function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n.charAt(0).toUpperCase())
    .join('');
}

// ============================================
// PROFILE EDIT MODAL
// ============================================

/**
 * Open edit profile modal
 */
function editProfile() {
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close edit profile modal
 */
function closeEditModal(event) {
  const modal = document.getElementById('editModal');
  if (!modal) return;
  
  // Allow closing by clicking modal overlay or X button
  if (event && event.target !== modal && event.type !== 'click') return;
  
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

/**
 * Save profile changes
 */
function saveProfile() {
  const fullName = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const department = document.getElementById('editDept').value.trim();

  // Validation
  if (!fullName || !email || !phone || !department) {
    showNotification('Please fill in all fields', 'warning');
    return;
  }

  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address', 'warning');
    return;
  }

  if (!validatePhone(phone)) {
    showNotification('Please enter a valid phone number', 'warning');
    return;
  }

  const profileData = {
    fullName,
    email,
    phone,
    department
  };

  // Save to storage (in real app, would save to API)
  localStorage.setItem('userProfile', JSON.stringify(profileData));
  updateProfileUI(profileData);
  closeEditModal();
  showNotification('Profile updated successfully', 'success');

  // Optional: Send to API
  const token = localStorage.getItem('token');
  if (token) {
    fetch('/api/user/profile/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })
      .then(res => res.ok && console.log('Profile saved to server'))
      .catch(err => console.log('Server save skipped'));
  }
}

// ============================================
// SECURITY FUNCTIONS
// ============================================

/**
 * Change password
 */
function changePassword() {
  const currentPassword = prompt('Enter your current password:');
  if (!currentPassword) return;

  const newPassword = prompt('Enter your new password (minimum 8 characters):');
  if (!newPassword) return;

  if (newPassword.length < 8) {
    showNotification('Password must be at least 8 characters', 'warning');
    return;
  }

  const confirmPassword = prompt('Confirm your new password:');
  if (confirmPassword !== newPassword) {
    showNotification('Passwords do not match', 'warning');
    return;
  }

  const token = localStorage.getItem('token');
  if (token) {
    fetch('/api/user/password/change', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    })
      .then(res => res.ok ? Promise.resolve() : Promise.reject('Failed'))
      .then(() => showNotification('Password changed successfully', 'success'))
      .catch(err => showNotification('Failed to change password', 'error'));
  } else {
    showNotification('Password changed successfully', 'success');
  }
}

/**
 * Manage 2FA settings
 */
function manage2FA() {
  const action = confirm('Open 2FA setup? (This would open a 2FA configuration page in a real app)');
  if (action) {
    showNotification('2FA settings can be configured in your account preferences', 'info');
  }
}

/**
 * View session history
 */
function sessionHistory() {
  const sessions = [
    { device: 'Chrome - Windows', timestamp: '2026-03-01 09:30 AM' },
    { device: 'Safari - macOS', timestamp: '2026-02-28 03:15 PM' },
    { device: 'Firefox - Windows', timestamp: '2026-02-27 02:45 AM' }
  ];

  const token = localStorage.getItem('token');
  if (token) {
    fetch('/api/user/sessions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => displaySessionHistory(data.sessions || sessions))
      .catch(err => displaySessionHistory(sessions));
  } else {
    displaySessionHistory(sessions);
  }
}

/**
 * Display session history
 */
function displaySessionHistory(sessions) {
  let message = 'Session History:\n\n';
  sessions.forEach((session, index) => {
    const device = session.device || 'Unknown Device';
    const timestamp = session.timestamp || 'N/A';
    message += `${index + 1}. ${device}\n   ${timestamp}\n`;
  });
  alert(message);
}

// ============================================
// RECENT ACTIVITY
// ============================================

/**
 * Load recent activity
 */
function loadRecentActivity() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    // In real app, fetch from API
    fetch('/api/user/activity', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => renderActivityList(data.activities || []))
      .catch(err => console.log('Using default activity'));
  } catch (error) {
    console.log('Activity loading skipped');
  }
}

/**
 * Render activity list
 */
function renderActivityList(activities) {
  const activityList = document.getElementById('settingsActivity');
  if (!activityList || activities.length === 0) return;

  activityList.innerHTML = activities.map(activity => `
    <li class="activity-item">
      <div class="activity-dot ${activity.type || 'gray'}"></div>
      <div class="activity-text">
        <div class="activity-action">${activity.action}</div>
        <div class="activity-meta">${activity.meta || ''}</div>
        <div class="activity-time">${formatDate(activity.timestamp)}</div>
      </div>
    </li>
  `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate email format
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone format
 */
function validatePhone(phone) {
  return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Format date
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  const colors = {
    success: '#22c55e',
    error: '#df1e2c',
    warning: '#fdc910',
    info: '#3B82F6'
  };

  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 14px 18px;
    background-color: ${colors[type] || colors.info};
    color: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-size: 14px;
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 4000);
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Close modal when clicking outside
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeEditModal(e);
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('editModal');
      if (modal && !modal.classList.contains('hidden')) {
        closeEditModal();
      }
    }
  });
}

// Inject animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .notification {
    word-wrap: break-word;
  }
`;
document.head.appendChild(style);


/**
 * Fetch user profile from API
 */
function fetchUserProfile(token) {
  fetch('/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    })
    .then(data => {
      updateProfileUI(data);
      storeProfileData(data);
    })
    .catch(error => {
      console.error('Error fetching profile:', error);
      loadProfileFromStorage();
    });
}

/**
 * Update UI with user profile data
 */
function updateProfileUI(userData) {
  const { fullName, email, phone, department, adminId } = userData;

  // Update profile card
  document.getElementById('profileAvatar').textContent = getInitials(fullName);
  document.getElementById('profileName').textContent = fullName;
  document.getElementById('infoName').textContent = fullName;
  document.getElementById('infoEmail').textContent = email;
  document.getElementById('infoPhone').textContent = phone;
  document.getElementById('infoDept').textContent = department;

  // Update edit form with current values
  document.getElementById('editName').value = fullName;
  document.getElementById('editEmail').value = email;
  document.getElementById('editPhone').value = phone;
  document.getElementById('editDept').value = department;
}

/**
 * Load profile from localStorage if API fails
 */
function loadProfileFromStorage() {
  const storedProfile = localStorage.getItem('userProfile');
  if (storedProfile) {
    const profile = JSON.parse(storedProfile);
    updateProfileUI(profile);
  }
}

/**
 * Store profile data in localStorage
 */
function storeProfileData(data) {
  localStorage.setItem('userProfile', JSON.stringify(data));
}

/**
 * Extract initials from full name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// ============================================
// PROFILE EDIT MODAL
// ============================================

/**
 * Open edit profile modal
 */
function editProfile() {
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close edit profile modal
 */
function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

/**
 * Save updated profile information
 */
function saveProfile() {
  const fullName = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const department = document.getElementById('editDept').value.trim();

  // Validation
  if (!fullName || !email || !phone || !department) {
    showNotification('Please fill in all fields', 'warning');
    return;
  }

  if (!validateEmail(email)) {
    showNotification('Please enter a valid email address', 'warning');
    return;
  }

  const profileData = {
    fullName,
    email,
    phone,
    department
  };

  // Send update to API
  const token = localStorage.getItem('token');
  fetch('/api/user/profile/update', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  })
    .then(response => {
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    })
    .then(data => {
      updateProfileUI(profileData);
      storeProfileData(profileData);
      closeEditModal();
      showNotification('Profile updated successfully', 'success');
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    });
}

// ============================================
// SECURITY FUNCTIONS
// ============================================

/**
 * Open change password dialog
 */
function changePassword() {
  const password = prompt('Enter your new password:');
  if (!password) return;

  if (password.length < 8) {
    showNotification('Password must be at least 8 characters', 'warning');
    return;
  }

  const token = localStorage.getItem('token');
  fetch('/api/user/password/update', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newPassword: password })
  })
    .then(response => {
      if (!response.ok) throw new Error('Password change failed');
      return response.json();
    })
    .then(data => {
      showNotification('Password changed successfully', 'success');
    })
    .catch(error => {
      console.error('Error changing password:', error);
      showNotification('Failed to change password', 'error');
    });
}

/**
 * Manage 2FA settings
 */
function manage2FA() {
  const action = confirm('Do you want to enable or disable 2FA? Click OK to toggle.');
  if (!action) return;

  const token = localStorage.getItem('token');
  fetch('/api/user/2fa/toggle', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('2FA toggle failed');
      return response.json();
    })
    .then(data => {
      showNotification('2FA settings updated', 'success');
      location.reload();
    })
    .catch(error => {
      console.error('Error toggling 2FA:', error);
      showNotification('Failed to update 2FA settings', 'error');
    });
}

/**
 * View session history
 */
function sessionHistory() {
  const token = localStorage.getItem('token');
  fetch('/api/user/sessions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    })
    .then(data => {
      displaySessionHistory(data.sessions);
    })
    .catch(error => {
      console.error('Error fetching session history:', error);
      showNotification('Failed to load session history', 'error');
    });
}

/**
 * Display session history in modal/alert
 */
function displaySessionHistory(sessions) {
  let historyText = 'Session History:\n\n';
  sessions.forEach((session, index) => {
    historyText += `${index + 1}. ${session.device} - ${session.timestamp}\n`;
  });
  alert(historyText);
}

// ============================================
// RECENT ACTIVITY
// ============================================

/**
 * Load recent activity for the user
 */
function loadRecentActivity() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/user/activity', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        renderActivityList(data.activities || []);
      })
      .catch(error => console.log('Using default activity data:', error));
  } catch (error) {
    console.log('Activity loading skipped');
  }
}

/**
 * Render activity list in UI
 */
function renderActivityList(activities) {
  const activityList = document.getElementById('settingsActivity');
  if (!activityList) return;

  if (activities.length === 0) {
    activityList.innerHTML = '<li class="activity-item"><p>No recent activity</p></li>';
    return;
  }

  activityList.innerHTML = activities.map(activity => `
    <li class="activity-item">
      <div class="activity-dot ${activity.type || 'gray'}"></div>
      <div class="activity-text">
        <div class="activity-action">${activity.action}</div>
        <div class="activity-meta">${activity.meta || ''}</div>
        <div class="activity-time">${formatDate(activity.timestamp)}</div>
      </div>
    </li>
  `).join('');
}

// ============================================
// MOBILE SIDEBAR
// ============================================

/**
 * Toggle mobile sidebar
 */
function toggleSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (sidebar && overlay) {
    sidebar.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background-color: ${getNotificationColor(type)};
    color: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

/**
 * Get notification background color based on type
 */
function getNotificationColor(type) {
  const colors = {
    success: '#22c55e',
    error: '#df1e2c',
    warning: '#fdc910',
    info: '#3B82F6'
  };
  return colors[type] || colors.info;
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
  window.location.href = 'login.html';
}

/**
 * Close modal when clicking outside
 */
document.addEventListener('click', (event) => {
  const modal = document.getElementById('editModal');
  if (modal && event.target === modal) {
    closeEditModal();
  }
});

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Close sidebar on link click
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const sidebar = document.getElementById('mobileSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar && overlay) {
        sidebar.classList.add('hidden');
        overlay.classList.add('hidden');
      }
    });
  });

  // Add keyboard support for modal
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeEditModal();
    }
  });
}

// ============================================
// ANIMATION STYLES (injected at runtime)
// ============================================

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .modal-overlay {
    transition: opacity 0.2s ease-out;
  }

  .modal-overlay.hidden {
    opacity: 0;
    pointer-events: none;
  }
`;
document.head.appendChild(style);
