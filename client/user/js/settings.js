/* ============================================
   PHILTMS — SETTINGS PAGE JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Switch between sidebar sections
  window.switchSection = function (section) {
    // Update nav items
    document.querySelectorAll('.settings-nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');

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

});