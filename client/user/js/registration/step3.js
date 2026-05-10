// ============================================
//  STEP 3 — OTP Verification
// ============================================

// ── Mask email for display ────────────────────
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 1);
  const dots    = '•'.repeat(Math.max(user.length - 1, 6));
  return `${visible}${dots}@${domain}`;
}

const storedEmail = sessionStorage.getItem('reg_email') || '';
const maskedEl    = document.getElementById('masked-email');
if (maskedEl && storedEmail) {
  maskedEl.textContent = maskEmail(storedEmail);
}

// ── OTP inputs — auto-advance & backspace ─────
const otpInputs = Array.from(document.querySelectorAll('.otp-input'));

otpInputs.forEach((input, index) => {
  // digits only — input event
  input.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    input.value = val ? val[0] : '';           // keep only first digit

    if (input.value) {
      input.classList.add('filled');
      input.classList.remove('error-state');
      if (index < otpInputs.length - 1) otpInputs[index + 1].focus();
    } else {
      input.classList.remove('filled');
    }
  });

  // backspace: clear current or go back
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (input.value) {
        input.value = '';
        input.classList.remove('filled');
      } else if (index > 0) {
        otpInputs[index - 1].focus();
        otpInputs[index - 1].value = '';
        otpInputs[index - 1].classList.remove('filled');
      }
    }
    // block non-numeric keys (allow control keys)
    if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  });

  // paste: spread digits across boxes
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData)
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, otpInputs.length - index);

    pasted.split('').forEach((char, i) => {
      if (otpInputs[index + i]) {
        otpInputs[index + i].value = char;
        otpInputs[index + i].classList.add('filled');
      }
    });

    // move focus to next empty box or last box
    const nextEmpty = otpInputs.findIndex(
      (inp, i) => i >= index && !inp.value
    );
    if (nextEmpty !== -1) otpInputs[nextEmpty].focus();
    else otpInputs[otpInputs.length - 1].focus();
  });
});

// ── Resend countdown ──────────────────────────
const countdownEl = document.getElementById('countdown');
const resendBtn   = document.getElementById('resend-btn');
const timerEl     = document.getElementById('resend-timer');

let intervalId = null;

function startResendTimer() {
  if (intervalId) clearInterval(intervalId);

  let seconds         = 60;
  countdownEl.textContent = seconds;
  timerEl.style.display   = 'inline';
  resendBtn.disabled      = true;

  intervalId = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(intervalId);
      intervalId            = null;
      resendBtn.disabled    = false;
      timerEl.style.display = 'none';
    }
  }, 1000);
}

// ── Build & validate session payload ─────────
function buildRegisterPayload() {
  return {
    first_name:  (sessionStorage.getItem('reg_first_name')  || '').trim(),
    last_name:   (sessionStorage.getItem('reg_last_name')   || '').trim(),
    middle_name: (sessionStorage.getItem('reg_middle_name') || '').trim(),
    birth_date:  (sessionStorage.getItem('reg_dob')         || '').trim(),
    user_sex:    (sessionStorage.getItem('reg_sex')         || '').trim(),
    email:       (sessionStorage.getItem('reg_email')       || '').trim(),
    password:    (sessionStorage.getItem('reg_password')    || ''),
    mobile_no:   (sessionStorage.getItem('reg_mobile')      || '').trim(),
  };
}

function validatePayload(payload) {
  if (!payload.first_name || !payload.last_name || !payload.birth_date || !payload.user_sex) {
    return 'Personal information is incomplete. Please go back to Step 1.';
  }
  if (!payload.email || !payload.password) {
    return 'Account details are incomplete. Please go back to Step 2.';
  }
  return '';
}

// ── Error helpers ─────────────────────────────
const otpError = document.getElementById('otp-error');

function showError(msg) {
  otpError.textContent = msg;
  otpInputs.forEach(inp => inp.classList.add('error-state'));
}

function clearError() {
  otpError.textContent = '';
  otpInputs.forEach(inp => inp.classList.remove('error-state'));
}

// ── Start registration & send OTP ────────────
async function startRegistrationAndSendOtp() {
  const payload = buildRegisterPayload();
  const err     = validatePayload(payload);
  if (err) throw new Error(err);
  await window.PhilTMSApi.postStartRegistration(payload);
}

// Fire on page load
startResendTimer();

startRegistrationAndSendOtp().catch((err) => {
  resendBtn.disabled = false;
  showError(err.message || 'Failed to send OTP. Please try again.');
});

// Resend
resendBtn.addEventListener('click', async () => {
  clearError();
  try {
    resendBtn.disabled = true;
    await startRegistrationAndSendOtp();
    startResendTimer();
  } catch (err) {
    resendBtn.disabled = false;
    showError(err.message || 'Failed to resend OTP. Please try again.');
  }
});

// ── Confirm / verify OTP ──────────────────────
document.getElementById('verify-btn').addEventListener('click', async () => {
  clearError();

  const otp       = otpInputs.map(i => i.value).join('');
  const verifyBtn = document.getElementById('verify-btn');

  if (otp.length < 6) {
    showError('Please enter the complete 6-digit code.');
    return;
  }

  const payload = buildRegisterPayload();
  const payloadErr = validatePayload(payload);
  if (payloadErr) {
    showError(payloadErr);
    return;
  }

  try {
    verifyBtn.disabled     = true;
    verifyBtn.textContent  = 'Verifying…';

    const result = await window.PhilTMSApi.postVerifyRegistration(payload.email, otp);

    if (result?.accessToken) sessionStorage.setItem('access_token', result.accessToken);
    if (result?.user_id)     sessionStorage.setItem('user_id',      result.user_id);

    window.location.href = 'confirmation.html';
  } catch (err) {
    showError(err.message || 'Verification failed. Please check the code and try again.');
  } finally {
    verifyBtn.disabled    = false;
    verifyBtn.textContent = 'Confirm';
  }
});

// Add Enter key support for OTP verification
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('verify-btn').click();
  }
});