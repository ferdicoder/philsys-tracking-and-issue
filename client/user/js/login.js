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

    window.location.href = '../pages/login-confirmation.html';
  } catch (error) {
    document.getElementById('identifier-error').textContent = 'Login failed. Please try again.';
    identifier.classList.add('error');
  }
});