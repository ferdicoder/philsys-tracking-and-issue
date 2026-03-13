/**
 * PhilTMS – Registration JavaScript
 * Handles validation, step navigation, and form state.
 */

'use strict';

// =============================================
// UTILITY HELPERS
// =============================================

/**
 * Show inline validation error on a form control.
 * @param {HTMLElement} el - The input element
 * @param {string} message - Error message
 */
function showError(el, message) {
  el.style.borderColor = '#ef4444';
  el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
  let errEl = el.parentElement.querySelector('.field-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error';
    errEl.style.cssText = 'font-size:11px;color:#ef4444;display:block;margin-top:3px;';
    el.parentElement.appendChild(errEl);
  }
  errEl.textContent = message;
}

/**
 * Clear validation error on a form control.
 * @param {HTMLElement} el
 */
function clearError(el) {
  el.style.borderColor = '';
  el.style.boxShadow = '';
  const errEl = el.parentElement.querySelector('.field-error');
  if (errEl) errEl.remove();
}

/**
 * Validate email format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate Philippine mobile number.
 * @param {string} mobile
 * @returns {boolean}
 */
function isValidMobile(mobile) {
  return /^(09|\+639)\d{9}$/.test(mobile.trim());
}

// =============================================
// STEP 1 – Personal Information
// =============================================
(function initStep1() {
  const form = document.getElementById('step1Form');
  if (!form) return;

  const btnNext = document.getElementById('btnNext');
  const fullNameEl = document.getElementById('fullName');

  // Clear error on input
  fullNameEl.addEventListener('input', () => clearError(fullNameEl));

  // Validate before proceeding
  btnNext.addEventListener('click', function (e) {
    let valid = true;

    if (!fullNameEl.value.trim()) {
      showError(fullNameEl, 'Full Name is required.');
      valid = false;
    }

    if (!valid) e.preventDefault();
  });
})();

// =============================================
// STEP 3 – Account Setup
// =============================================
(function initStep3() {
  const form = document.getElementById('step3Form');
  if (!form) return;

  const emailEl     = document.getElementById('email');
  const passwordEl  = document.getElementById('password');
  const confirmEl   = document.getElementById('confirmPassword');
  const agreeEl     = document.getElementById('agreeTerms');
  const btnContinue = document.getElementById('btnContinue');

  [emailEl, passwordEl, confirmEl].forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  btnContinue.addEventListener('click', function (e) {
    let valid = true;

    if (!emailEl.value.trim() || !isValidEmail(emailEl.value)) {
      showError(emailEl, 'Please enter a valid email address.');
      valid = false;
    }

    if (!passwordEl.value || passwordEl.value.length < 8) {
      showError(passwordEl, 'Password must be at least 8 characters.');
      valid = false;
    }

    if (confirmEl.value !== passwordEl.value) {
      showError(confirmEl, 'Passwords do not match.');
      valid = false;
    }

    if (!agreeEl.checked) {
      alert('You must agree to the Terms of Service and Privacy Policy to continue.');
      valid = false;
    }

    if (!valid) e.preventDefault();
  });
})();

// =============================================
// STEP 4 – OTP Verification
// =============================================
(function initVerification() {
  const btnVerify = document.getElementById('btnVerify');
  if (!btnVerify) return;

  btnVerify.addEventListener('click', function (e) {
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(i => i.value).join('');

    if (otp.length < 6) {
      e.preventDefault();
      alert('Please enter the complete 6-digit OTP.');
      inputs[otp.length].focus();
    }
  });
})();

// =============================================
// GLOBAL – Prevent form default submit
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => e.preventDefault());
  });
});