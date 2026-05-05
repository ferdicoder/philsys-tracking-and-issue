// step4-verification.js — OTP Verification

// Fill in masked contact info from session
const email  = sessionStorage.getItem('reg_email') || '';
const mobile = sessionStorage.getItem('reg_mobile') || '';

if (email) {
  const [user, domain] = email.split('@');
  const masked = user.slice(0,1) + '•'.repeat(Math.max(user.length - 1, 6)) + '@' + domain;
  document.getElementById('masked-email').textContent = masked;
}

// OTP inputs — auto advance
const otpInputs = document.querySelectorAll('.otp-input');

otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    input.value = val;
    if (val) {
      input.classList.add('filled');
      if (index < otpInputs.length - 1) otpInputs[index + 1].focus();
    } else {
      input.classList.remove('filled');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus();
      otpInputs[index - 1].classList.remove('filled');
    }
  });

  // Allow only numbers
  input.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });
});

// Resend countdown
let timer = 60;
const countdownEl = document.getElementById('countdown');
const resendBtn   = document.getElementById('resend-btn');
const timerEl     = document.getElementById('resend-timer');

let intervalId = null;

function startResendTimer() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  timer = 60;
  countdownEl.textContent = timer;
  timerEl.style.display = 'inline';
  resendBtn.disabled = true;

  intervalId = setInterval(() => {
    timer--;
    countdownEl.textContent = timer;
    if (timer <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      resendBtn.disabled = false;
      timerEl.style.display = 'none';
    }
  }, 1000);
}

function getRegistrationPayload() {
  return buildRegisterPayload();
}

async function startRegistrationAndSendOtp() {
  const payload = getRegistrationPayload();
  const payloadError = validateRegisterPayload(payload);
  if (payloadError) {
    throw new Error(payloadError);
  }

  await window.PhilTMSApi.postStartRegistration(payload);
}

startResendTimer();

startRegistrationAndSendOtp().catch((error) => {
  resendBtn.disabled = false;
  const otpError = document.getElementById('otp-error');
  otpError.textContent = error.message || 'Failed to send OTP. Please try again.';
});

resendBtn.addEventListener('click', async () => {
  const otpError = document.getElementById('otp-error');
  otpError.textContent = '';

  try {
    resendBtn.disabled = true;
    await startRegistrationAndSendOtp();
    startResendTimer();
  } catch (error) {
    resendBtn.disabled = false;
    otpError.textContent = error.message || 'Failed to resend OTP.';
  }
});

function buildRegisterPayload() {
  return {
    first_name: (sessionStorage.getItem('reg_first_name') || '').trim(),
    last_name: (sessionStorage.getItem('reg_last_name') || '').trim(),
    middle_name: (sessionStorage.getItem('reg_middle_name') || '').trim(),
    // suffix: (sessionStorage.getItem('reg_middle_name') || '').trim(),
    birth_date: (sessionStorage.getItem('reg_dob') || '').trim(),
    user_sex: (sessionStorage.getItem('reg_sex') || '').trim(),
    email: (sessionStorage.getItem('reg_email') || '').trim(),
    password: sessionStorage.getItem('reg_password') || '',
    mobile_no: (sessionStorage.getItem('reg_mobile') || '').trim()
  };
}

function validateRegisterPayload(payload) {
  if (!payload.first_name || !payload.last_name || !payload.birth_date || !payload.user_sex) {
    return 'Please complete your personal information in Step 1.';
  }

  if (!payload.email || !payload.password) {
    return 'Please complete your account details in Step 3.';
  }

  return '';
}

// Verify button
document.getElementById('verify-btn').addEventListener('click', async () => {
  const otp = Array.from(otpInputs).map(i => i.value).join('');
  const otpError = document.getElementById('otp-error');
  const verifyBtn = document.getElementById('verify-btn');
  otpError.textContent = '';

  if (otp.length < 6) {
    otpError.textContent = 'Please enter the complete 6-digit code.';
    return;
  }

  const payload = getRegistrationPayload();
  const payloadError = validateRegisterPayload(payload);
  if (payloadError) {
    otpError.textContent = payloadError;
    return;
  }

  try {
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';

    const result = await window.PhilTMSApi.postVerifyRegistration(payload.email, otp);

    if (result && result.accessToken) {
      sessionStorage.setItem('access_token', result.accessToken);
    }
    if (result && result.user_id) {
      sessionStorage.setItem('user_id', result.user_id);
    }

    window.location.href = 'confirmation.html';
  } catch (error) {
    otpError.textContent = error.message || 'Registration failed. Please try again.';
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Confirm';
  }
});