// login-confirmation.js

// Show user name from session
const userName = sessionStorage.getItem('user_name') || 'User';
const welcomeEl = document.getElementById('welcome-name');
if (welcomeEl) welcomeEl.textContent = `Welcome, ${userName}!`;