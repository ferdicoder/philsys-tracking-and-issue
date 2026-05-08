/* ============================================
   PHILTMS — DASHBOARD JS
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const searchInput = document.getElementById('dashSearch');

  /* =========================
     SIDEBAR TOGGLE
  ========================= */

  function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('hidden');
  }

  hamburger?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', toggleSidebar);

  /* =========================
     COUNT ANIMATION
  ========================= */

  function animateCounts() {

    const counters = document.querySelectorAll('[data-count]');

    counters.forEach(counter => {

      const target = Number(counter.dataset.count);
      let current = 0;

      const increment = Math.ceil(target / 50);

      function updateCounter() {

        current += increment;

        if (current >= target) {
          counter.textContent = target.toLocaleString();
          return;
        }

        counter.textContent = current.toLocaleString();

        requestAnimationFrame(updateCounter);
      }

      updateCounter();

    });

  }

  animateCounts();

  /* =========================
     SEARCH TABLE
  ========================= */

  searchInput?.addEventListener('input', e => {

    const value = e.target.value.toLowerCase();

    document.querySelectorAll('#dashAppTable tbody tr')
      .forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display =
          text.includes(value)
            ? ''
            : 'none';

      });

  });

});