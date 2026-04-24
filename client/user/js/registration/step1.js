const form = document.getElementById('step1-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const firstName = document.getElementById('first-name');
  const lastName  = document.getElementById('last-name');
  const dob       = document.getElementById('dob');
  const sex       = document.getElementById('sex');

  // Clear errors
  ['first-name-error','last-name-error','dob-error','sex-error'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  [firstName, lastName, dob, sex].forEach(el => el.classList.remove('error'));

  if (!firstName.value.trim()) {
    document.getElementById('first-name-error').textContent = 'First name is required.';
    firstName.classList.add('error');
    valid = false;
  }
  if (!lastName.value.trim()) {
    document.getElementById('last-name-error').textContent = 'Last name is required.';
    lastName.classList.add('error');
    valid = false;
  }
  if (!dob.value) {
    document.getElementById('dob-error').textContent = 'Date of birth is required.';
    dob.classList.add('error');
    valid = false;
  }
  if (!sex.value) {
    document.getElementById('sex-error').textContent = 'Sex is required.';
    sex.classList.add('error');
    valid = false;
  }

  if (valid) {
    sessionStorage.setItem('reg_first_name', firstName.value.trim());
    sessionStorage.setItem('reg_last_name', lastName.value.trim());
    sessionStorage.setItem('reg_middle_name', document.getElementById('middle-name').value.trim());
    sessionStorage.setItem('reg_suffix', document.getElementById('suffix').value);
    sessionStorage.setItem('reg_dob', dob.value);
    sessionStorage.setItem('reg_sex', sex.value);
    window.location.href = 'step3.html';
  }
});