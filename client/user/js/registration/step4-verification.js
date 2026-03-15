// step4-verification.js — OTP Verification

// Fill in masked contact info from session
const email  = sessionStorage.getItem('reg_email') || '';
const mobile = sessionStorage.getItem('reg_mobile') || '';

if (email) {
  const [user, domain] = email.split('@');
  const masked = user.slice(0,1) + '•'.repeat(Math.max(user.length - 1, 6)) + '@' + domain;
  document.getElementById('masked-email').textContent = masked;
}
if (mobile) {
  document.getElementById('masked-phone').textContent = '+63 9•• ••• • ' + mobile.slice(-4);
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

resendBtn.disabled = true;

const interval = setInterval(() => {
  timer--;
  countdownEl.textContent = timer;
  if (timer <= 0) {
    clearInterval(interval);
    resendBtn.disabled = false;
    timerEl.style.display = 'none';
  }
}, 1000);

resendBtn.addEventListener('click', () => {
  alert('A new OTP has been sent.');
});

// Verify button
document.getElementById('verify-btn').addEventListener('click', () => {
  const otp = Array.from(otpInputs).map(i => i.value).join('');
  document.getElementById('otp-error').textContent = '';

  if (otp.length < 6) {
    document.getElementById('otp-error').textContent = 'Please enter the complete 6-digit code.';
    return;
  }

  // For demo: any 6 digits passes
  window.location.href = 'confirmation.html';
});