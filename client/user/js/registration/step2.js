// step2.js — Government ID Verification

const form = document.getElementById('step2-form');
const idType = document.getElementById('id-type');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // ID upload is intentionally skipped for now.
  // Keep selected ID type in case it is needed in later iterations.
  sessionStorage.setItem('reg_id_type', idType.value || '');
  window.location.href = 'step3.html';
});