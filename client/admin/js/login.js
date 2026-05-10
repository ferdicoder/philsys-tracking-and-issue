/* ============================================
   PHILTMS — ADMIN OTP LOGIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('adminEmail');
  const otpInput = document.getElementById('otpInput');
  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const emailError = document.getElementById('email-error');
  const otpError = document.getElementById('otp-error');
  const loadingOverlay = document.getElementById('login-loading-overlay');

  let lastEmail = '';

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notify';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function setError(input, errorEl, message) {
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message || '';
  }

  function clearError(input, errorEl) {
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showLoading() {
    if (!loadingOverlay) return;
    loadingOverlay.classList.add('active');
    loadingOverlay.setAttribute('aria-hidden', 'false');
  }

  function hideLoading() {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove('active');
    loadingOverlay.setAttribute('aria-hidden', 'true');
  }

  async function sendOtp() {
    const email = emailInput.value.trim().toLowerCase();
    clearError(emailInput, emailError);

    if (!email) {
      setError(emailInput, emailError, 'Please enter your admin email.');
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending OTP...';

    try {
      const response = await fetch('/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to send OTP');
      }

      lastEmail = email;
      showToast('OTP sent. Check your email.');
      otpInput.focus();
    } catch (error) {
      setError(emailInput, emailError, error.message || 'Failed to send OTP.');
    } finally {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Send OTP';
    }
  }

  async function verifyOtp() {
    const email = emailInput.value.trim().toLowerCase();
    const otp = otpInput.value.trim();
    let redirecting = false;

    clearError(otpInput, otpError);
    clearError(emailInput, emailError);

    if (!email) {
      setError(emailInput, emailError, 'Please enter your admin email.');
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    if (!otp || otp.length < 6) {
      setError(otpInput, otpError, 'Enter the 6-digit code.');
      otpInput.focus();
      return;
    }

    if (lastEmail && email !== lastEmail) {
      setError(emailInput, emailError, 'Email does not match the OTP request.');
      return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = 'Verifying...';
    showLoading();

    try {
      const response = await fetch('/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      if (!data.accessToken || data.role !== 'admin') {
        throw new Error('Admin access required');
      }

      window.PhilTmsAuth?.setSession({
        accessToken: data.accessToken,
        role: data.role,
        email
      });

      showToast('OTP verified. Redirecting...');
      redirecting = true;
      setTimeout(() => {
        window.location.href = '../../admin/pages/dashboard.html';
      }, 500);
    } catch (error) {
      setError(otpInput, otpError, error.message || 'Invalid OTP.');
    } finally {
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = 'Verify and Continue';
      if (!redirecting) hideLoading();
    }
  }

  sendOtpBtn?.addEventListener('click', sendOtp);
  verifyOtpBtn?.addEventListener('click', verifyOtp);

  emailInput?.addEventListener('input', () => clearError(emailInput, emailError));
  otpInput?.addEventListener('input', () => clearError(otpInput, otpError));

  emailInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendOtp();
  });

  otpInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyOtp();
  });
});