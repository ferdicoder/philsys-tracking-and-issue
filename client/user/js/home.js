/* ============================================
   PHILTMS — HOME PAGE JS
   Alert dismiss, Nav active state, Tracker
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     ALERT DISMISS
     ============================================ */
  const alertDismissBtns = document.querySelectorAll('[data-dismiss="alert"]');
  alertDismissBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const alert = btn.closest('.alert');
      if (alert) {
        alert.style.transition = 'opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-6px)';
        alert.style.maxHeight = alert.offsetHeight + 'px';
        // Collapse after fade
        setTimeout(() => {
          alert.style.maxHeight = '0';
          alert.style.marginBottom = '0';
          alert.style.paddingTop = '0';
          alert.style.paddingBottom = '0';
          alert.style.overflow = 'hidden';
        }, 200);
        setTimeout(() => alert.remove(), 550);
      }
    });
  });

  /* ============================================
     NAV ACTIVE STATE
     Sets active class based on current page href
     ============================================ */
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href')?.split('/').pop() || '';
    if (linkPath && linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  /* ============================================
     QUICK ACTION CARD — KEYBOARD ACCESSIBILITY
     ============================================ */
  const qaCards = document.querySelectorAll('.quick-action-card');
  qaCards.forEach(card => {
    // Allow Enter/Space to trigger the card link
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
    // Ensure focusable
    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }
  });

  /* ============================================
     STATUS TRACKER — ANIMATE ON SCROLL
     Uses IntersectionObserver for entrance effect
     ============================================ */
  const trackerSteps = document.querySelectorAll('.tracker-step');

  if ('IntersectionObserver' in window) {
    const trackerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('tracker-visible');
          trackerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    trackerSteps.forEach((step, i) => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(10px)';
      step.style.transition = `opacity 0.35s ease ${i * 0.08}s, transform 0.35s ease ${i * 0.08}s`;
      trackerObserver.observe(step);
    });
  }

  // CSS class toggle for tracked steps
  document.addEventListener('animationend', () => {}, { once: true });

  // Manually trigger visible state for already-in-view items
  setTimeout(() => {
    trackerSteps.forEach(step => {
      step.style.opacity = '1';
      step.style.transform = 'translateY(0)';
    });
  }, 100);

  /* ============================================
     PAGE CONTENT — STAGGERED FADE-IN
     ============================================ */
  const animateItems = document.querySelectorAll('.animate-in');
  animateItems.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = `opacity 0.35s ease ${0.05 + i * 0.07}s, transform 0.35s ease ${0.05 + i * 0.07}s`;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50);
  });

  /* ============================================
     MODAL HELPERS (reusable across pages)
     Usage: openModal('modal-id') / closeModal('modal-id')
     ============================================ */
  window.openModal = function (id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Focus first focusable element
      const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) setTimeout(() => focusable.focus(), 50);
    }
  };

  window.closeModal = function (id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Close modal on overlay click
  document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.overlay.active').forEach(overlay => {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });

  // Wire up modal close buttons
  document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.overlay');
      if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  /* ============================================
     TAB SWITCHER (reusable)
     ============================================ */
  document.querySelectorAll('.tab-bar').forEach(tabBar => {
    tabBar.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        // Deactivate all tabs in this bar
        tabBar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show matching tab content
        const targetId = tab.dataset.tab;
        if (targetId) {
          const container = tabBar.closest('.card, .card-wide, .section-block, .page-wrapper') || document;
          container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          const target = document.getElementById(targetId);
          if (target) target.classList.add('active');
        }
      });
    });
  });

  /* ============================================
     RADIO ITEM — SELECTED STATE
     ============================================ */
  document.querySelectorAll('.radio-item').forEach(item => {
    item.addEventListener('click', () => {
      const group = item.closest('.radio-group');
      if (group) group.querySelectorAll('.radio-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      const radio = item.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  document.querySelectorAll('.radio-inline-item').forEach(item => {
    item.addEventListener('click', () => {
      const group = item.closest('.radio-inline');
      if (group) group.querySelectorAll('.radio-inline-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });

  /* ============================================
     DRAG & DROP UPLOAD
     ============================================ */
  document.querySelectorAll('.upload-area').forEach(area => {
    const input = area.querySelector('.upload-input');
    const preview = area.querySelector('.upload-preview');

    // Click to trigger file picker
    area.addEventListener('click', () => input && input.click());

    // Drag events
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('dragover');
    });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length && preview) {
        preview.textContent = Array.from(files).map(f => f.name).join(', ');
      }
    });

    // File input change
    if (input) {
      input.addEventListener('change', () => {
        if (input.files.length && preview) {
          preview.textContent = Array.from(input.files).map(f => f.name).join(', ');
        }
      });
    }
  });

  /* ============================================
     OTP INPUT — AUTO-ADVANCE
     ============================================ */
  const otpInputs = document.querySelectorAll('.otp-input');
  otpInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1) {
        input.classList.add('filled');
        if (i < otpInputs.length - 1) otpInputs[i + 1].focus();
      } else {
        input.classList.remove('filled');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) {
        otpInputs[i - 1].focus();
        otpInputs[i - 1].classList.remove('filled');
      }
    });

    // Allow only digits
    input.addEventListener('keypress', (e) => {
      if (!/\d/.test(e.key)) e.preventDefault();
    });
  });

  /* ============================================
     PASSWORD TOGGLE
     ============================================ */
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.input-password-wrapper');
      if (!wrapper) return;
      const input = wrapper.querySelector('.form-input');
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      // Swap icon
      btn.innerHTML = isPassword
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  });

});