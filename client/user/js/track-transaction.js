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

});