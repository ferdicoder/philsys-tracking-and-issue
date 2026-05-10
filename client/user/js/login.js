//pass toggle
document.getElementById('toggle-password').addEventListener('click', () => {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
});

//login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  let valid = true;

  const identifier = document.getElementById('identifier');
  const password   = document.getElementById('password');

  document.getElementById('identifier-error').textContent = '';
  document.getElementById('password-error').textContent = '';
  identifier.classList.remove('error');
  password.classList.remove('error');

  if (!identifier.value.trim()) {
    document.getElementById('identifier-error').textContent = 'Email is required.';
    identifier.classList.add('error');
    valid = false;
  }
  if (!password.value) {
    document.getElementById('password-error').textContent = 'Password is required.';
    password.classList.add('error');
    valid = false;
  }
  if (!valid) return;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: identifier.value.trim(),
        password: password.value
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error || 'Unable to sign in.';
      if (response.status === 401) {
        document.getElementById('password-error').textContent = message;
        password.classList.add('error');
        return;
      }
      document.getElementById('identifier-error').textContent = message;
      identifier.classList.add('error');
      return;
    }

    if (window.PhilTmsAuth) {
      window.PhilTmsAuth.setSession({
        accessToken: data.accessToken,
        user_id:     data.user_id,
        role:        data.role,
        user_name:   data.user_name,
        email:       data.email
      });
    }

    sessionStorage.setItem('user_name', data.user_name || 'User');

    if (data.role === 'admin') {
      window.location.href = '../../admin/pages/dashboard.html';
      return;
    }

    showLoadingOverlay();
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 3000);

  } catch (error) {
    document.getElementById('identifier-error').textContent = 'Login failed. Please try again.';
    identifier.classList.add('error');
  }
});

// Add Enter key support for login form
document.getElementById('login-form').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.querySelector('.login-btn').click();
  }
});

//loading overlay
function showLoadingOverlay() {
  const overlay = document.getElementById('login-loading-overlay');
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

//forgot password flow
let userEmail   = '';
let verifiedOtp = '';

function openForgotPasswordModal(event) {
  event.preventDefault();

  // Reset to step 1
  document.getElementById('step1-email').style.display    = 'block';
  document.getElementById('step2-code').style.display     = 'none';
  document.getElementById('step3-password').style.display = 'none';
  document.getElementById('step4-success').style.display  = 'none';

  // Clear inputs & errors
  document.getElementById('resetEmail').value        = '';
  document.getElementById('verificationCode').value  = '';
  document.getElementById('newPassword').value       = '';
  document.getElementById('confirmPassword').value   = '';
  clearAllErrors();

  document.getElementById('forgotPwOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeForgotPasswordModal() {
  document.getElementById('forgotPwOverlay').style.display = 'none';
  document.body.style.overflow = '';
  userEmail   = '';
  verifiedOtp = '';
}

function clearAllErrors() {
  ['email-error', 'code-error', 'newpassword-error', 'confirmpassword-error']
    .forEach(id => { document.getElementById(id).textContent = ''; });

  ['resetEmail', 'verificationCode', 'newPassword', 'confirmPassword']
    .forEach(id => { document.getElementById(id).style.borderColor = '#d1d5db'; });
}

//STEP 1: Send Verification Code
async function sendVerificationCode() {
  const emailInput = document.getElementById('resetEmail');
  const errorDiv   = document.getElementById('email-error');
  const sendBtn    = document.getElementById('sendCodeBtn');
  const email      = emailInput.value.trim();

  // Reset error state
  errorDiv.textContent            = '';
  emailInput.style.borderColor    = '#d1d5db';

  // Client-side validation
  if (!email) {
    errorDiv.textContent         = 'Please enter your email address.';
    emailInput.style.borderColor = '#ef4444';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorDiv.textContent         = 'Please enter a valid email address.';
    emailInput.style.borderColor = '#ef4444';
    return;
  }

  sendBtn.disabled    = true;
  sendBtn.textContent = 'Sending...';

  // Always advance to step 2 — never reveal if an email is registered.
  await fetch('/password/forgot/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email })
  }).catch(() => {});

  sendBtn.disabled    = false;
  sendBtn.textContent = 'Send Verification Code';

  userEmail   = email;
  verifiedOtp = '';
  goToStep2(email);
}

function goToStep2(email) {
  document.getElementById('step1-email').style.display = 'none';
  document.getElementById('step2-code').style.display  = 'block';
  document.getElementById('emailDisplay').textContent  = email;
}

// ── STEP 2: Verify Code ─────────────────────────────────────────
async function verifyCode() {
  const codeInput = document.getElementById('verificationCode');
  const errorDiv  = document.getElementById('code-error');
  const verifyBtn = document.getElementById('verifyCodeBtn');
  const code      = codeInput.value.trim();

  errorDiv.textContent          = '';
  codeInput.style.borderColor   = '#d1d5db';

  if (!code) {
    errorDiv.textContent        = 'Please enter the verification code.';
    codeInput.style.borderColor = '#ef4444';
    return;
  }
  if (code.length !== 6) {
    errorDiv.textContent        = 'Code must be exactly 6 digits.';
    codeInput.style.borderColor = '#ef4444';
    return;
  }

  verifyBtn.disabled    = true;
  verifyBtn.textContent = 'Verifying...';

  try {
    const response = await fetch('/password/forgot/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: userEmail, otp: code })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      errorDiv.textContent        = data?.error || 'Invalid or expired code.';
      codeInput.style.borderColor = '#ef4444';
      return;
    }

    verifiedOtp = code;
    document.getElementById('step2-code').style.display     = 'none';
    document.getElementById('step3-password').style.display = 'block';

  } catch {
    errorDiv.textContent        = 'Failed to verify code. Please try again.';
    codeInput.style.borderColor = '#ef4444';
  } finally {
    verifyBtn.disabled    = false;
    verifyBtn.textContent = 'Verify Code';
  }
}

// ── STEP 3: Reset Password ──────────────────────────────────────
async function resetPassword() {
  const newPasswordInput     = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const newPasswordError     = document.getElementById('newpassword-error');
  const confirmPasswordError = document.getElementById('confirmpassword-error');
  const resetBtn             = document.getElementById('resetPasswordBtn');

  const newPassword     = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  newPasswordError.textContent         = '';
  confirmPasswordError.textContent     = '';
  newPasswordInput.style.borderColor   = '#d1d5db';
  confirmPasswordInput.style.borderColor = '#d1d5db';

  let valid = true;

  if (!newPassword) {
    newPasswordError.textContent       = 'Please enter a new password.';
    newPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  } else if (newPassword.length < 8) {
    newPasswordError.textContent       = 'Password must be at least 8 characters.';
    newPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  }

  if (!confirmPassword) {
    confirmPasswordError.textContent       = 'Please confirm your password.';
    confirmPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  } else if (newPassword !== confirmPassword) {
    confirmPasswordError.textContent       = 'Passwords do not match.';
    confirmPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  }

  if (!valid) return;

  if (!verifiedOtp) {
    newPasswordError.textContent = 'Please verify the code first.';
    return;
  }

  resetBtn.disabled    = true;
  resetBtn.textContent = 'Resetting...';

  try {
    const response = await fetch('/password/forgot/reset', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: userEmail, otp: verifiedOtp, newPassword })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      newPasswordError.textContent = data?.error || 'Failed to reset password.';
      return;
    }

    document.getElementById('step3-password').style.display = 'none';
    document.getElementById('step4-success').style.display  = 'block';

  } catch {
    newPasswordError.textContent = 'Failed to reset password. Please try again.';
  } finally {
    resetBtn.disabled    = false;
    resetBtn.textContent = 'Reset Password';
  }
}

// ── RESEND ──────────────────────────────────────────────────────
async function resendCode(event) {
  event.preventDefault();
  const errorDiv = document.getElementById('code-error');
  errorDiv.textContent = '';

  try {
    const response = await fetch('/password/forgot/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: userEmail })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      errorDiv.textContent = data?.error || 'Failed to resend code.';
      return;
    }

    verifiedOtp = '';
    errorDiv.style.color   = '#22c55e';
    errorDiv.style.fontStyle = 'normal';
    errorDiv.textContent   = `A new code was sent to ${userEmail}.`;

  } catch {
    errorDiv.style.color = '#22c55e';
    errorDiv.textContent = `Code resent to ${userEmail}.`;
  }
}

// ── HELPERS ─────────────────────────────────────────────────────
function goBackToStep1() {
  document.getElementById('step2-code').style.display  = 'none';
  document.getElementById('step1-email').style.display = 'block';
  document.getElementById('verificationCode').value    = '';
  document.getElementById('code-error').textContent    = '';
  verifiedOtp = '';
}

function toggleNewPassword() {
  const input = document.getElementById('newPassword');
  input.type  = input.type === 'password' ? 'text' : 'password';
}

function toggleConfirmPassword() {
  const input = document.getElementById('confirmPassword');
  input.type  = input.type === 'password' ? 'text' : 'password';
}

// Close on backdrop click
document.addEventListener('click', function (event) {
  const overlay = document.getElementById('forgotPwOverlay');
  if (event.target === overlay) closeForgotPasswordModal();
});

// Close on ESC
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return;
  const overlay = document.getElementById('forgotPwOverlay');
  if (overlay && overlay.style.display === 'flex') closeForgotPasswordModal();
});