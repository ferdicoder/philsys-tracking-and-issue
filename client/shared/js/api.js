async function postRegister(payload) {
	const response = await fetch('/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	let data = {};
	try {
		data = await response.json();
	} catch (_) {
		data = {};
	}

	if (!response.ok) {
		const message = data.error || 'Registration failed. Please try again.';
		throw new Error(message);
	}

	return data;
}

window.PhilTMSApi = {
	postRegister
};
