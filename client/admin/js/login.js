/* ============================================
   PHILTMS — ADMIN LOGIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const accountSelect = document.getElementById('adminAccount');

  window.updateRole = function () {
    const select   = accountSelect || document.getElementById('adminAccount');
    const selected = select.options[select.selectedIndex];
    document.getElementById('roleHint').textContent = `Role: ${selected.getAttribute('data-role') || ''}`;
    document.getElementById('passwordInput').value  = selected.getAttribute('data-password') || '';
    document.getElementById('admin-error').textContent = '';
  };

  if (accountSelect) {
    accountSelect.addEventListener('change', updateRole);
    updateRole();
  }

  // ── Toggle password visibility ──
  window.togglePassword = function () {
    const input = document.getElementById('passwordInput');
    const icon  = document.getElementById('eyeIcon');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
         <circle cx="12" cy="12" r="3"/>`;
  };

window.handleSignIn = function () {
  const accountSelect = document.getElementById('adminAccount');
  const selected      = accountSelect?.options[accountSelect.selectedIndex];
  const identifier    = selected?.value || '';
  const correctPw     = selected?.getAttribute('data-password') || '';
  const password      = document.getElementById('passwordInput').value;
  const input         = document.getElementById('passwordInput');
  const errorEl       = document.getElementById('admin-error');

  if (errorEl) errorEl.textContent = '';
  input.style.borderColor = '';
  input.style.boxShadow   = '';

  if (!identifier) {
    if (errorEl) errorEl.textContent = 'Select a valid admin account.';
    return;
  }

  if (!password) {
    input.style.borderColor = 'var(--color-error, #ef4444)';
    input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.12)';
    input.focus();
    return;
  }

  // Check password locally
  if (password !== correctPw) {
    input.style.borderColor = 'var(--color-error, #ef4444)';
    input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.12)';
    if (errorEl) errorEl.textContent = 'Incorrect password. Please try again.';
    return;
  }

// Password matched — go to dashboard
  window.location.href = '../../admin/pages/dashboard.html';
};

  // ── Forgot Password Modal ──
  window.openForgotPasswordModal = function (event) {
    event.preventDefault();
    // Reset to form step
    document.getElementById('forgotPwContent').style.display = 'block';
    document.getElementById('forgotPwSuccess').style.display = 'none';
    document.getElementById('resetEmail').value = '';
    document.getElementById('reset-error').textContent = '';
    // Show overlay
    const overlay = document.getElementById('forgotPwOverlay');
    overlay.style.opacity    = '1';
    overlay.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  };

  window.closeForgotPasswordModal = function () {
    const overlay = document.getElementById('forgotPwOverlay');
    overlay.style.opacity    = '0';
    overlay.style.visibility = 'hidden';
    document.body.style.overflow = '';
  };

  // ── Send Reset Link ──
  window.handlePasswordReset = async function () {
    const emailInput = document.getElementById('resetEmail');
    const errorEl    = document.getElementById('reset-error');
    const resetBtn   = document.getElementById('resetBtn');
    const email      = emailInput.value.trim();

    errorEl.textContent = '';

    if (!email) {
      errorEl.textContent = 'Please enter your email address.';
      emailInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorEl.textContent = 'Please enter a valid email address.';
      emailInput.focus();
      return;
    }

    resetBtn.disabled    = true;
    resetBtn.textContent = 'Sending...';

    try {
      // Replace with real API call in production
      await new Promise(resolve => setTimeout(resolve, 1200));

      document.getElementById('sentEmail').textContent = email;
      document.getElementById('forgotPwContent').style.display = 'none';
      document.getElementById('forgotPwSuccess').style.display  = 'block';

    } catch (error) {
      errorEl.textContent = 'Failed to send reset link. Please try again.';
    } finally {
      resetBtn.disabled    = false;
      resetBtn.textContent = 'Send Reset Link';
    }
  };

  // ── Close modal on backdrop click ──
  document.getElementById('forgotPwOverlay')?.addEventListener('click', function (e) {
    if (e.target === this) window.closeForgotPasswordModal();
  });

  // ── Close modal on Escape key ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('forgotPwOverlay');
      if (overlay?.style.visibility === 'visible') window.closeForgotPasswordModal();
    }
  });

  // ── Clear password error on input ──
  document.getElementById('passwordInput')?.addEventListener('input', function () {
    this.style.borderColor = '';
    this.style.boxShadow   = '';
    const errorEl = document.getElementById('admin-error');
    if (errorEl) errorEl.textContent = '';
  });

  // ── Enter key triggers sign in ──
  document.getElementById('passwordInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSignIn();
  });

});