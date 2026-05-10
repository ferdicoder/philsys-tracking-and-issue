// ============================================
//  STEP 2 — Account Setup
//  Handles: eye toggles, strength meter, validation
// ============================================

// ── SVG snippets ──────────────────────────────
const SVG_CIRCLE = `<circle cx="12" cy="12" r="10"/>`;
const SVG_CHECK  = `<polyline points="20 6 9 17 4 12"/>`;
const SVG_EYE_ON = `
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>`;
const SVG_EYE_OFF = `
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
    a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4
    c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
  <line x1="1" y1="1" x2="23" y2="23"/>`;

// Strength level labels & colours
const STRENGTH_LEVELS  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS  = ['', '#df1e2c', '#f97316', '#fdc910', '#22c55e'];

// Password hint rules  { elementId: testFn }
const PW_RULES = {
  'hint-len':     v => v.length >= 8,
  'hint-upper':   v => /[A-Z]/.test(v),
  'hint-num':     v => /[0-9]/.test(v),
  'hint-special': v => /[^A-Za-z0-9]/.test(v),
};

// ── Helper: set up eye-toggle for one field ──
function setupToggle(btnId, inputId, svgId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  const svg   = document.getElementById(svgId);
  if (!btn || !input || !svg) return;

  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type     = isHidden ? 'text' : 'password';
    svg.innerHTML  = isHidden ? SVG_EYE_OFF : SVG_EYE_ON;
  });
}

// ── Strength meter ────────────────────────────
function initStrengthMeter() {
  const pwInput     = document.getElementById('new-password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthLbl = document.getElementById('strength-label');
  if (!pwInput) return;

  pwInput.addEventListener('input', () => {
    const v     = pwInput.value;
    let   score = 0;

    Object.entries(PW_RULES).forEach(([id, fn]) => {
      const li  = document.getElementById(id);
      if (!li) return;
      const met = fn(v);
      li.classList.toggle('met', met);
      li.querySelector('svg').innerHTML = met ? SVG_CHECK : SVG_CIRCLE;
      if (met) score++;
    });

    const cls = v.length && score ? ` str-${score}` : '';
    strengthBar.className   = 'strength-bar-wrap' + cls;
    strengthLbl.textContent = v.length ? STRENGTH_LEVELS[score] : '';
    strengthLbl.style.color = STRENGTH_COLORS[score] || '';
  });
}

// ── Mobile: digits only ───────────────────────
function initMobileInput() {
  const mobile = document.getElementById('mobile');
  if (!mobile) return;
  mobile.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
  });
}

// ── Validation helpers ────────────────────────
function clearErrors(ids) {
  ids.forEach(id => {
    const err = document.getElementById(id + '-error');
    const inp = document.getElementById(id);
    if (err) err.textContent = '';
    if (inp) inp.classList.remove('error');
  });
  // checkbox error has no matching input
  const termsErr = document.getElementById('terms-error');
  if (termsErr) termsErr.textContent = '';
}

function setError(inputId, errorId, msg) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  if (inp) inp.classList.add('error');
  if (err) err.textContent = msg;
}

// ── Form submission ───────────────────────────
function initForm() {
  const form = document.getElementById('step2-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    clearErrors(['email', 'mobile', 'new-password', 'confirm-password']);

    const email   = document.getElementById('email').value.trim();
    const mobile  = document.getElementById('mobile').value.trim();
    const pw      = document.getElementById('new-password').value;
    const cpw     = document.getElementById('confirm-password').value;
    const terms   = document.getElementById('terms').checked;

    let valid = true;

    // Email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'email-error', 'Please enter a valid email address.');
      valid = false;
    }

    // Mobile
    if (!mobile || mobile.length < 10) {
      setError('mobile', 'mobile-error', 'Enter a valid 10-digit mobile number.');
      valid = false;
    }

    // Password — require score ≥ 3
    const pwScore = Object.values(PW_RULES).filter(fn => fn(pw)).length;
    if (!pw || pw.length < 8) {
      setError('new-password', 'password-error', 'Password must be at least 8 characters.');
      valid = false;
    } else if (pwScore < 3) {
      setError('new-password', 'password-error', 'Password is too weak. Please meet more of the requirements above.');
      valid = false;
    }

    // Confirm password
    if (!cpw) {
      setError('confirm-password', 'confirm-error', 'Please confirm your password.');
      valid = false;
    } else if (pw !== cpw) {
      setError('confirm-password', 'confirm-error', 'Passwords do not match.');
      valid = false;
    }

    // Terms
    if (!terms) {
      const termsErr = document.getElementById('terms-error');
      if (termsErr) termsErr.textContent = 'You must agree to the terms to continue.';
      valid = false;
    }

    if (valid) {
      sessionStorage.setItem('reg_email',    email);
      sessionStorage.setItem('reg_mobile',   '+63' + mobile);
      // Store temporarily so Step 3 can complete registration.
      sessionStorage.setItem('reg_password', pw);
      window.location.href = 'step3.html';
    }
  });
}

// ── Back button ───────────────────────────────
function initBack() {
  const btn = document.getElementById('btn-back');
  if (btn) btn.addEventListener('click', () => history.back());
}

// ── Init all ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupToggle('toggle-new',     'new-password',     'eye-new');
  setupToggle('toggle-confirm', 'confirm-password', 'eye-confirm');
  initStrengthMeter();
  initMobileInput();
  initForm();
  initBack();
});