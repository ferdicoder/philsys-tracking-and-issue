/* ============================================
   PHILTMS — ADMIN LOGIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Update role hint when admin account changes
  window.updateRole = function () {
    const select = document.getElementById('adminAccount');
    const selected = select.options[select.selectedIndex];
    const role = selected.getAttribute('data-role') || '';
    document.getElementById('roleHint').textContent = `Role: ${role}`;
  };

  // Toggle password visibility
  window.togglePassword = function () {
    const input = document.getElementById('passwordInput');
    const icon  = document.getElementById('eyeIcon');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    // Swap icon
    icon.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  };

  // Sign In handler
  window.handleSignIn = async function () {
    const accountSelect = document.getElementById('adminAccount');
    const selected = accountSelect?.options[accountSelect.selectedIndex];
    const identifier = selected?.getAttribute('data-email') || selected?.value || '';
    const password = document.getElementById('passwordInput').value.trim();
    const input = document.getElementById('passwordInput');
    const errorEl = document.getElementById('admin-error');

    if (errorEl) errorEl.textContent = '';

    if (!identifier) {
      if (errorEl) errorEl.textContent = 'Select a valid admin account.';
      return;
    }

    if (!password) {
      input.style.borderColor = 'var(--color-error)';
      input.style.boxShadow   = '0 0 0 3px rgba(223,30,44,0.10)';
      input.focus();
      return;
    }

    input.style.borderColor = '';
    input.style.boxShadow   = '';

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: identifier,
          password: password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (errorEl) errorEl.textContent = data?.error || 'Unable to sign in.';
        return;
      }

      if (data.role !== 'admin') {
        if (errorEl) errorEl.textContent = 'This account does not have admin access.';
        return;
      }

      if (window.PhilTmsAuth) {
        window.PhilTmsAuth.setSession({
          accessToken: data.accessToken,
          user_id: data.user_id,
          role: data.role,
          user_name: data.user_name,
          email: data.email
        });
      }

      window.location.href = '../pages/dashboard.html';
    } catch (error) {
      if (errorEl) errorEl.textContent = 'Login failed. Please try again.';
    }
  };

  // Clear password error on type
  document.getElementById('passwordInput')?.addEventListener('input', function () {
    this.style.borderColor = '';
    this.style.boxShadow   = '';
    const errorEl = document.getElementById('admin-error');
    if (errorEl) errorEl.textContent = '';
  });

  // Enter key support
  document.getElementById('passwordInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSignIn();
  });

});