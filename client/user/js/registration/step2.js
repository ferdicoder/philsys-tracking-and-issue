// step2.js — Government ID Verification

const form       = document.getElementById('step2-form');
const uploadArea = document.getElementById('upload-area');
const fileInput  = document.getElementById('file-input');
const preview    = document.getElementById('upload-preview');

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  const allowed = ['image/jpeg','image/png','image/jpg','application/pdf'];
  if (!allowed.includes(file.type)) {
    document.getElementById('file-error').textContent = 'Only JPG, PNG, or PDF files are allowed.';
    return;
  }
  document.getElementById('file-error').textContent = '';
  preview.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  sessionStorage.setItem('reg_id_file', file.name);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const idType = document.getElementById('id-type');
  document.getElementById('id-type-error').textContent = '';
  document.getElementById('file-error').textContent = '';
  idType.classList.remove('error');

  if (!idType.value) {
    document.getElementById('id-type-error').textContent = 'Please select an ID type.';
    idType.classList.add('error');
    valid = false;
  }
  if (!sessionStorage.getItem('reg_id_file') && !fileInput.files[0]) {
    document.getElementById('file-error').textContent = 'Please upload your government ID.';
    valid = false;
  }

  if (valid) {
    sessionStorage.setItem('reg_id_type', idType.value);
    window.location.href = 'step3.html';
  }
});