document.addEventListener('DOMContentLoaded', () => {
	const session = window.PhilTmsAuth?.getSession?.();
	const reportTableBody = document.getElementById('reportTableBody');
	const reportModal = document.getElementById('reportModal');
	const statusSelect = document.getElementById('reportStatusUpdate');

	let reportsCache = [];
	let activeReport = null;

	if (!session?.accessToken) {
		window.location.href = 'login.html';
		return;
	}

	function formatDate(value) {
		if (!value) return '—';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return date.toLocaleDateString();
	}

	function formatType(value) {
		if (!value) return '—';
		if (value === 'follow') return 'Follow-up';
		if (value === 'concern') return 'Concern';
		return value;
	}

	function renderReports(list) {
		if (!reportTableBody) return;
		reportTableBody.innerHTML = '';

		if (!list.length) {
			const row = document.createElement('tr');
			row.innerHTML = '<td colspan="7">No reports yet.</td>';
			reportTableBody.appendChild(row);
			return;
		}

		list.forEach((report) => {
			const row = document.createElement('tr');
			const fullName = [report.first_name, report.last_name].filter(Boolean).join(' ') || '—';
			const trn = report.tracking_number || '—';

			row.innerHTML = `
				<td>${report.report_id}</td>
				<td>${trn}</td>
				<td>${fullName}</td>
				<td>${formatType(report.type)}</td>
				<td>${formatDate(report.created_at)}</td>
				<td>${report.status || '—'}</td>
				<td><button class="btn btn-outline" data-report-id="${report.report_id}">View</button></td>
			`;

			reportTableBody.appendChild(row);
		});
	}

	function openReportModal(report) {
		activeReport = report;
		if (!reportModal) return;

		document.getElementById('detailReportId').textContent = report.report_id || '—';
		document.getElementById('detailTRN').textContent = report.tracking_number || '—';
		document.getElementById('detailApplicantName').textContent = [report.first_name, report.last_name].filter(Boolean).join(' ') || '—';
		document.getElementById('detailReportType').textContent = formatType(report.type);
		document.getElementById('detailDate').textContent = formatDate(report.created_at);
		document.getElementById('detailStatus').textContent = report.status || '—';

		if (statusSelect) {
			statusSelect.value = report.status || 'pending';
		}

		reportModal.classList.remove('hidden');
	}

	function closeReportModal() {
		if (!reportModal) return;
		reportModal.classList.add('hidden');
		activeReport = null;
	}

	function bindTableActions() {
		if (!reportTableBody) return;
		reportTableBody.addEventListener('click', (event) => {
			const button = event.target.closest('button[data-report-id]');
			if (!button) return;
			const reportId = button.getAttribute('data-report-id');
			const report = reportsCache.find(item => item.report_id === reportId);
			if (report) openReportModal(report);
		});
	}

	function loadReports() {
		fetch('/reports', {
			headers: {
				Authorization: `Bearer ${session.accessToken}`
			}
		})
			.then((response) => {
				if (!response.ok) throw new Error('Failed to load reports');
				return response.json();
			})
			.then((data) => {
				reportsCache = Array.isArray(data.reports) ? data.reports : [];
				renderReports(reportsCache);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	window.filterReports = function (query) {
		const q = String(query || '').toLowerCase().trim();
		if (!q) {
			renderReports(reportsCache);
			return;
		}

		const filtered = reportsCache.filter((report) => {
			const fullName = [report.first_name, report.last_name].filter(Boolean).join(' ').toLowerCase();
			const trn = String(report.tracking_number || '').toLowerCase();
			const reportId = String(report.report_id || '').toLowerCase();
			return reportId.includes(q) || trn.includes(q) || fullName.includes(q);
		});

		renderReports(filtered);
	};

	window.closeReportModal = function () {
		closeReportModal();
	};

	window.saveReportStatus = function () {
		if (!activeReport) return;
		const status = statusSelect?.value || '';
		if (!status) return;

		fetch(`/reports/${activeReport.report_id}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ status })
		})
			.then((response) => {
				if (!response.ok) throw new Error('Failed to update report');
				return response.json();
			})
			.then((data) => {
				const updated = data.report;
				if (updated) {
					reportsCache = reportsCache.map((item) => item.report_id === updated.report_id ? { ...item, status: updated.status } : item);
					renderReports(reportsCache);
				}
				closeReportModal();
			})
			.catch((error) => {
				console.error(error);
				alert('Unable to update status. Please try again.');
			});
	};

	bindTableActions();
	loadReports();
});
