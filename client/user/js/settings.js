/* ============================================
   PHILTMS — SETTINGS PAGE JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Switch between sidebar sections
  window.switchSection = function (event, section) {
    // Update nav items
    document.querySelectorAll('.settings-nav-item').forEach(item => item.classList.remove('active'));
    event?.currentTarget?.classList.add('active');

    // Show/hide panels
    document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.add('hidden'));
    const target = section === 'account' ? 'sectionAccount' : 'sectionNotifications';
    document.getElementById(target).classList.remove('hidden');
  };

  // Save toggle
  window.saveToggle = function (el, key) {
    localStorage.setItem(key, el.checked);
  };

  // Restore toggle states
  document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(input => {
    const key = input.getAttribute('onchange')?.match(/'([^']+)'/)?.[1];
    if (key && localStorage.getItem(key) !== null) {
      input.checked = localStorage.getItem(key) === 'true';
    }
  });

  function formatBirthDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async function loadProfile() {
    const session = window.PhilTmsAuth?.getSession?.();
    if (!session?.accessToken) return;

    try {
      const response = await fetch('/user/me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) return;

      const user = await response.json();

      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User';
      const trn = user.tracking_number || '--';

      const nameEl = document.getElementById('profileName');
      const trnEl = document.getElementById('profileTrn');
      if (nameEl) nameEl.textContent = fullName;
      if (trnEl) trnEl.textContent = `TRN: ${trn}`;

      const firstNameInput = document.getElementById('firstNameInput');
      const lastNameInput = document.getElementById('lastNameInput');
      const dobInput = document.getElementById('dobInput');
      const trnInput = document.getElementById('trnInput');
      const emailInput = document.getElementById('emailInput');
      const mobileInput = document.getElementById('mobileInput');

      if (firstNameInput) firstNameInput.value = user.first_name || '';
      if (lastNameInput) lastNameInput.value = user.last_name || '';
      if (dobInput) dobInput.value = formatBirthDate(user.birth_date) || '';
      if (trnInput) trnInput.value = trn;
      if (emailInput) emailInput.value = user.email || '';
      if (mobileInput) mobileInput.value = user.mobile_no || '';
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  // Save Changes button
  document.getElementById('saveBtn')?.addEventListener('click', () => {
    const btn = document.getElementById('saveBtn');
    btn.textContent = '✓ Saved!';
    btn.style.backgroundColor = 'var(--color-success)';
    setTimeout(() => {
      btn.textContent = 'Save Changes';
      btn.style.backgroundColor = '';
    }, 2000);
  });

  // Cancel button
  document.getElementById('cancelBtn')?.addEventListener('click', () => {
    if (confirm('Discard changes?')) location.reload();
  });

  loadProfile();

});