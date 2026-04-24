// step3.js — Account Setup

// Password toggles
function setupToggle(toggleId, inputId) {
  document.getElementById(toggleId).addEventListener('click', () => {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
  });
}
setupToggle('toggle-new', 'new-password');
setupToggle('toggle-confirm', 'confirm-password');

// Form submission
document.getElementById('step3-form').addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const email    = document.getElementById('email');
  const newPass  = document.getElementById('new-password');
  const confPass = document.getElementById('confirm-password');
  const terms    = document.getElementById('terms');

  // Clear errors
  ['email-error','password-error','confirm-error','terms-error'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  [email, newPass, confPass].forEach(el => el.classList.remove('error'));

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email address.';
    email.classList.add('error');
    valid = false;
  }

  // Validate password
  if (newPass.value.length < 8) {
    document.getElementById('password-error').textContent = 'Password must be at least 8 characters.';
    newPass.classList.add('error');
    valid = false;
  }

  // Validate confirm password
  if (confPass.value !== newPass.value) {
    document.getElementById('confirm-error').textContent = 'Passwords do not match.';
    confPass.classList.add('error');
    valid = false;
  }

  // Validate terms
  if (!terms.checked) {
    document.getElementById('terms-error').textContent = 'You must agree to the terms to continue.';
    valid = false;
  }

  if (valid) {
    sessionStorage.setItem('reg_email', email.value.trim());
    sessionStorage.setItem('reg_mobile', document.getElementById('mobile').value.trim());
    sessionStorage.setItem('reg_password', newPass.value);
    window.location.href = 'step4-verification.html';
  }
});