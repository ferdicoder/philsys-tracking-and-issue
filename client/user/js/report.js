/* ============================================
   PHILTMS — REPORT PAGE JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  async function loadProfileName() {
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
      const nameEl = document.getElementById('reportUserName');
      if (nameEl) nameEl.textContent = fullName;
    } catch (error) {
      console.error('Failed to load profile name:', error);
    }
  }

  /* ── Tab switcher ── */
  window.switchTab = function (tab) {
    document.getElementById('tabFollowup').classList.toggle('active', tab === 'followup');
    document.getElementById('tabConcern').classList.toggle('active', tab === 'concern');
    document.getElementById('panelFollowup').classList.toggle('hidden', tab !== 'followup');
    document.getElementById('panelConcern').classList.toggle('hidden', tab !== 'concern');
  };

  /* ── Who is this for ── */
  window.setFor = function (who) {
    document.getElementById('forMyself').classList.toggle('rpt-for-btn--active', who === 'myself');
    document.getElementById('forSomeone').classList.toggle('rpt-for-btn--active', who === 'someone');
    document.getElementById('relationshipSection').classList.toggle('hidden', who !== 'someone');
  };

  /* ── Select radio option ── */
  window.selectOption = function (el, name) {
    el.closest('.rpt-option-list').querySelectorAll('.rpt-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input[type="radio"]').checked = true;
  };

/* ── Submit Follow-up ── */
window.submitFollowup = function () {
  const trn = document.getElementById('fuTRN')?.value.trim();
  if (!trn) {
    document.getElementById('fuTRN').classList.add('error');
    document.getElementById('fuTRN').focus();
    return;
  }
  document.getElementById('fuTRN').classList.remove('error');
  document.getElementById('overlayFollowup').style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

/* ── Submit Report ── */
window.submitReport = function () {
  const trn = document.getElementById('reportTRN')?.value.trim();
  if (!trn) {
    document.getElementById('reportTRN').classList.add('error');
    document.getElementById('reportTRN').focus();
    return;
  }
  document.getElementById('reportTRN').classList.remove('error');
  document.getElementById('overlayReport').style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

/* ── Close overlay ── */
window.closeOverlay = function (id) {
  document.getElementById(id).style.display = 'none';
  document.body.style.overflow = '';
};

/* ── Close on backdrop click ── */
document.querySelectorAll('.overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
});

/* ── Escape key ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.overlay').forEach(o => {
      if (o.style.display === 'flex') {
        o.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
});
  /* ── Clear error on input ── */
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });

  loadProfileName();

});