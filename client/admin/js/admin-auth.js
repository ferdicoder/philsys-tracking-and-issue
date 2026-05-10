document.addEventListener('DOMContentLoaded', () => {
  const session = window.PhilTmsAuth?.getSession?.();

  if (!session?.accessToken) {
    window.location.href = 'login.html';
    return;
  }

  fetch('/admin/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unauthorized');
      }
      return response.json();
    })
    .then((data) => {
      if (data.role !== 'admin') {
        throw new Error('Forbidden');
      }
    })
    .catch(() => {
      window.PhilTmsAuth?.clearSession?.();
      window.location.href = 'login.html';
    });

  document.querySelectorAll('.nav-logout, .sidebar-link.logout').forEach((link) => {
    link.addEventListener('click', () => {
      window.PhilTmsAuth?.clearSession?.();
    });
  });
});
