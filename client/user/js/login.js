// login.js

// Password toggle
document.getElementById('toggle-password').addEventListener('click', () => {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
});

// Form submit
document.getElementById('login-form').addEventListener('submit', (e) => {
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

  if (valid) {
    // Store user info and redirect to login confirmation
    sessionStorage.setItem('user_name', 'Virginia Valdez');
    window.location.href = '../../../../../../confirmation.html';
  }
});