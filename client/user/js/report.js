/* ============================================
   PHILTMS — REPORT PAGE JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  function syncTrnInputsFromStorage() {
    const storedTrn = localStorage.getItem('philtms_trn') || '';
    if (!storedTrn) return;

    const followupTrn = document.getElementById('fuTRN');
    const reportTrn = document.getElementById('reportTRN');

    if (followupTrn && !followupTrn.value) followupTrn.value = storedTrn;
    if (reportTrn && !reportTrn.value) reportTrn.value = storedTrn;
  }

  function bindTrnSyncToStorage() {
    const inputs = [
      document.getElementById('fuTRN'),
      document.getElementById('reportTRN')
    ].filter(Boolean);

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const value = input.value.trim();
        if (value) localStorage.setItem('philtms_trn', value);
      });
    });
  }

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

  function parseReportContent(content) {
    const parts = String(content || '').split('|').map(item => item.trim()).filter(Boolean);
    const detailMap = {};
    parts.forEach((part) => {
      const [key, ...rest] = part.split(':');
      if (!key || !rest.length) return;
      detailMap[key.trim().toLowerCase()] = rest.join(':').trim();
    });

    return {
      selectedOption: detailMap['follow-up type'] || detailMap['concern type'] || '—',
      description: detailMap['details'] || ''
    };
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
  }

  function formatStatus(status) {
    return String(status || '').trim().toLowerCase();
  }

  function renderReportHistory(list) {
    const container = document.getElementById('reportHistoryList');
    if (!container) return;

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = '<div class="history-empty">No reports submitted yet.</div>';
      return;
    }

    container.innerHTML = list.map((report) => {
      const parsed = parseReportContent(report.report_content);
      const statusValue = formatStatus(report.status);
      const statusClass = statusValue ? `history-status--${statusValue}` : '';
      const label = parsed.selectedOption || 'Report';
      const details = parsed.description ? parsed.description : 'No description provided.';

      return `
        <div class="history-item">
          <div class="history-meta">
            <span>${formatDate(report.created_at)}</span>
            <span class="history-status ${statusClass}">${statusValue || 'pending'}</span>
          </div>
          <div class="history-title">${label}</div>
          <div class="history-desc">${details}</div>
        </div>
      `;
    }).join('');
  }

  async function loadUserReports() {
    const session = window.PhilTmsAuth?.getSession?.();
    if (!session?.accessToken) return;

    try {
      const response = await fetch('/reports/me', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) return;

      const payload = await response.json();
      renderReportHistory(payload.reports || []);
    } catch (error) {
      console.error('Failed to load report history:', error);
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
  const trnInput = document.getElementById('fuTRN');
  const trnValue = trnInput?.value.trim();
  const detailsValue = document.getElementById('fuDetails')?.value.trim() || '';
  const selectedOption = document.querySelector('input[name="fuType"]:checked')?.closest('.rpt-option');
  const selectedLabel = selectedOption?.querySelector('.rpt-option-title')?.textContent?.trim();
  const forMyself = document.getElementById('forMyself')?.classList.contains('rpt-for-btn--active');
  const relationshipValue = document.querySelector('input[name="rel"]:checked')?.value || '';

  if (!trnValue) {
    trnInput.classList.add('error');
    trnInput.focus();
    alert('Please enter your TRN.');
    return;
  }

  if (!selectedLabel) {
    alert('Please select a follow-up type.');
    return;
  }

  const contentParts = [
    `TRN: ${trnValue}`,
    `Follow-up type: ${selectedLabel}`,
    `For: ${forMyself ? 'Myself' : 'Someone else'}`
  ];

  if (!forMyself && relationshipValue) {
    contentParts.push(`Relationship: ${relationshipValue}`);
  }

  if (detailsValue) {
    contentParts.push(`Details: ${detailsValue}`);
  }

  const session = window.PhilTmsAuth?.getSession?.();
  if (!session?.accessToken) return;

  fetch('/reports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reportContent: contentParts.join(' | '),
      reportType: 'follow'
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to submit follow-up.');
      }

      trnInput.classList.remove('error');
      loadUserReports();
      document.getElementById('overlayFollowup').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    })
    .catch((error) => {
      console.error(error);
      alert('Unable to submit follow-up. Please try again.');
    });
};

/* ── Submit Report ── */
window.submitReport = function () {
  const trnInput = document.getElementById('reportTRN');
  const trnValue = trnInput?.value.trim();
  const detailsValue = document.getElementById('reportDetails')?.value.trim() || '';
  const selectedOption = document.querySelector('input[name="concern"]:checked')?.closest('.rpt-option');
  const selectedLabel = selectedOption?.querySelector('.rpt-option-title')?.textContent?.trim();

  if (!trnValue) {
    trnInput.classList.add('error');
    trnInput.focus();
    alert('Please enter your TRN.');
    return;
  }

  if (!selectedLabel) {
    alert('Please select a concern type.');
    return;
  }

  const contentParts = [
    `TRN: ${trnValue}`,
    `Concern type: ${selectedLabel}`
  ];

  if (detailsValue) {
    contentParts.push(`Details: ${detailsValue}`);
  }

  const session = window.PhilTmsAuth?.getSession?.();
  if (!session?.accessToken) return;

  fetch('/reports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reportContent: contentParts.join(' | '),
      reportType: 'concern'
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to submit report.');
      }

      trnInput.classList.remove('error');
      loadUserReports();
      document.getElementById('overlayReport').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    })
    .catch((error) => {
      console.error(error);
      alert('Unable to submit report. Please try again.');
    });
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
  syncTrnInputsFromStorage();
  bindTrnSyncToStorage();
  loadUserReports();

});