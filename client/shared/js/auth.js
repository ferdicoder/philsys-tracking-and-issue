(function () {
	const STORAGE_KEY = 'philtms_auth';

	function setSession(session) {
		if (!session || !session.accessToken) return;
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
	}

	function getSession() {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch (error) {
			sessionStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}

	function clearSession() {
		sessionStorage.removeItem(STORAGE_KEY);
	}

	window.PhilTmsAuth = {
		setSession,
		getSession,
		clearSession
	};
})();
