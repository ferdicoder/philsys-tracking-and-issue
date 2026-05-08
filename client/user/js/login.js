// login.js

// Password toggle
document.getElementById('toggle-password').addEventListener('click', () => {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
});

// Form submit
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
    document.getElementById('identifier-error').textContent = 'PhilSys Number or Email is required.';
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
      headers: {
        'Content-Type': 'application/json'
      },
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
        user_id: data.user_id,
        role: data.role,
        user_name: data.user_name,
        email: data.email
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
}); // <-- CLOSE THE FORM SUBMIT LISTENER HERE

function showLoadingOverlay() {
  const overlay = document.getElementById('login-loading-overlay');
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ============================================
// FORGOT PASSWORD FLOW
// ============================================

let userEmail = '';
let verifiedOtp = '';

function openForgotPasswordModal(event) {
  event.preventDefault();
  
  // Reset to step 1
  document.getElementById('step1-email').style.display = 'block';
  document.getElementById('step2-code').style.display = 'none';
  document.getElementById('step3-password').style.display = 'none';
  document.getElementById('step4-success').style.display = 'none';
  
  // Clear all inputs and errors
  document.getElementById('resetEmail').value = '';
  document.getElementById('verificationCode').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  clearAllErrors();
  
  // Show modal
  document.getElementById('forgotPwOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeForgotPasswordModal() {
  document.getElementById('forgotPwOverlay').style.display = 'none';
  document.body.style.overflow = '';
  userEmail = '';
  verifiedOtp = '';
}

function clearAllErrors() {
  document.getElementById('email-error').textContent = '';
  document.getElementById('code-error').textContent = '';
  document.getElementById('newpassword-error').textContent = '';
  document.getElementById('confirmpassword-error').textContent = '';
  
  document.getElementById('resetEmail').style.borderColor = '#cbd5e1';
  document.getElementById('verificationCode').style.borderColor = '#cbd5e1';
  document.getElementById('newPassword').style.borderColor = '#cbd5e1';
  document.getElementById('confirmPassword').style.borderColor = '#cbd5e1';
}

// STEP 1: Send Verification Code
async function sendVerificationCode() {
  const emailInput = document.getElementById('resetEmail');
  const errorDiv = document.getElementById('email-error');
  const sendBtn = document.getElementById('sendCodeBtn');
  
  const email = emailInput.value.trim();
  
  // Clear errors
  errorDiv.textContent = '';
  emailInput.style.borderColor = '#cbd5e1';
  
  // Validate email
  if (!email) {
    errorDiv.textContent = 'Please enter your email address';
    emailInput.style.borderColor = '#ef4444';
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorDiv.textContent = 'Please enter a valid email address';
    emailInput.style.borderColor = '#ef4444';
    return;
  }
  
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';

  try {
    const response = await fetch('/password/forgot/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      errorDiv.textContent = data?.error || 'Failed to send code. Please try again.';
      emailInput.style.borderColor = '#ef4444';
      return;
    }

    userEmail = email;
    verifiedOtp = '';

    document.getElementById('step1-email').style.display = 'none';
    document.getElementById('step2-code').style.display = 'block';
    document.getElementById('emailDisplay').textContent = email;
  } catch (error) {
    errorDiv.textContent = 'Failed to send code. Please try again.';
    emailInput.style.borderColor = '#ef4444';
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send Verification Code';
  }
}

// STEP 2: Verify Code
async function verifyCode() {
  const codeInput = document.getElementById('verificationCode');
  const errorDiv = document.getElementById('code-error');
  const verifyBtn = document.getElementById('verifyCodeBtn');
  
  const code = codeInput.value.trim();
  
  // Clear errors
  errorDiv.textContent = '';
  codeInput.style.borderColor = '#cbd5e1';
  
  // Validate code
  if (!code) {
    errorDiv.textContent = 'Please enter the verification code';
    codeInput.style.borderColor = '#ef4444';
    return;
  }
  
  if (code.length !== 6) {
    errorDiv.textContent = 'Code must be 6 digits';
    codeInput.style.borderColor = '#ef4444';
    return;
  }
  
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';

  try {
    const response = await fetch('/password/forgot/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, otp: code })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      errorDiv.textContent = data?.error || 'Invalid or expired code';
      codeInput.style.borderColor = '#ef4444';
      return;
    }

    verifiedOtp = code;
    document.getElementById('step2-code').style.display = 'none';
    document.getElementById('step3-password').style.display = 'block';
  } catch (error) {
    errorDiv.textContent = 'Failed to verify code. Please try again.';
    codeInput.style.borderColor = '#ef4444';
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify Code';
  }
}

// STEP 3: Reset Password
async function resetPassword() {
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const newPasswordError = document.getElementById('newpassword-error');
  const confirmPasswordError = document.getElementById('confirmpassword-error');
  const resetBtn = document.getElementById('resetPasswordBtn');
  
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  // Clear errors
  newPasswordError.textContent = '';
  confirmPasswordError.textContent = '';
  newPasswordInput.style.borderColor = '#cbd5e1';
  confirmPasswordInput.style.borderColor = '#cbd5e1';
  
  let valid = true;
  
  // Validate new password
  if (!newPassword) {
    newPasswordError.textContent = 'Please enter a new password';
    newPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  } else if (newPassword.length < 8) {
    newPasswordError.textContent = 'Password must be at least 8 characters';
    newPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  }
  
  // Validate confirm password
  if (!confirmPassword) {
    confirmPasswordError.textContent = 'Please confirm your password';
    confirmPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  } else if (newPassword !== confirmPassword) {
    confirmPasswordError.textContent = 'Passwords do not match';
    confirmPasswordInput.style.borderColor = '#ef4444';
    valid = false;
  }
  
  if (!valid) return;
  
  if (!verifiedOtp) {
    newPasswordError.textContent = 'Please verify the code first';
    return;
  }

  resetBtn.disabled = true;
  resetBtn.textContent = 'Resetting...';

  try {
    const response = await fetch('/password/forgot/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        otp: verifiedOtp,
        newPassword
      })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      newPasswordError.textContent = data?.error || 'Failed to reset password';
      return;
    }

    document.getElementById('step3-password').style.display = 'none';
    document.getElementById('step4-success').style.display = 'block';
  } catch (error) {
    newPasswordError.textContent = 'Failed to reset password. Please try again.';
  } finally {
    resetBtn.disabled = false;
    resetBtn.textContent = 'Reset Password';
  }
}

// Helper Functions
async function resendCode(event) {
  event.preventDefault();

  const errorDiv = document.getElementById('code-error');
  errorDiv.textContent = '';

  try {
    const response = await fetch('/password/forgot/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      errorDiv.textContent = data?.error || 'Failed to resend code.';
      return;
    }

    verifiedOtp = '';
    alert('A new verification code has been sent to ' + userEmail);
  } catch (error) {
    errorDiv.textContent = 'Failed to resend code.';
  }
}

function goBackToStep1() {
  document.getElementById('step2-code').style.display = 'none';
  document.getElementById('step1-email').style.display = 'block';
  document.getElementById('verificationCode').value = '';
  document.getElementById('code-error').textContent = '';
  verifiedOtp = '';
}

function toggleNewPassword() {
  const input = document.getElementById('newPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function toggleConfirmPassword() {
  const input = document.getElementById('confirmPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
}

// Close on click outside
document.addEventListener('click', function(event) {
  const overlay = document.getElementById('forgotPwOverlay');
  if (event.target === overlay) {
    closeForgotPasswordModal();
  }
});

// Close on ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const overlay = document.getElementById('forgotPwOverlay');
    if (overlay && overlay.style.display === 'flex') {
      closeForgotPasswordModal();
    }
  }
});