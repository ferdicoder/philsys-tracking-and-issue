/* ============================================
   PHILTMS — TRACK PAGE JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const input      = document.getElementById('issueInput');
  const checkBtn   = document.getElementById('checkBtn');
  const results    = document.getElementById('resultsSection');
  const refDisplay = document.getElementById('refDisplay');

  // Enter key support
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCheck();
  });

  // Clear error on type
  input?.addEventListener('input', () => {
    input.classList.remove('error');
  });

  checkBtn?.addEventListener('click', handleCheck);

  async function loadProfile() {
    const session = window.PhilTmsAuth?.getSession?.();
    if (!session?.accessToken) return;

    try {
      const response = await fetch('/user/me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) return;

      const user = await response.json();
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User';
      const trn = user.tracking_number || '--';

      const nameEl = document.getElementById('trackUserName');
      const mobileEl = document.getElementById('trackUserMobile');
      const trnEl = document.getElementById('trackUserTrn');

      if (nameEl) nameEl.textContent = fullName;
      if (mobileEl) mobileEl.textContent = user.mobile_no || '--';
      if (trnEl) trnEl.textContent = trn;
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  function handleCheck() {
    const val = input?.value.trim();

    if (!val) {
      input.classList.add('error');
      input.focus();
      return;
    }

    input.classList.remove('error');

    // Update reference display
    if (refDisplay) refDisplay.textContent = val;

    // Show results with animation
    if (results) {
      results.classList.remove('hidden');
      results.style.opacity = '0';
      results.style.transform = 'translateY(10px)';
      results.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      requestAnimationFrame(() => {
        results.style.opacity = '1';
        results.style.transform = 'translateY(0)';
      });
      setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  loadProfile();

});