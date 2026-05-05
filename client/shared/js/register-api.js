async function parseJsonSafely(response) {
	try {
		return await response.json();
	} catch (_) {
		return {};
	}
}

async function postRegister(payload) {
	const response = await fetch('/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	const data = await parseJsonSafely(response);

	if (!response.ok) {
		const message = data.error || 'Registration failed. Please try again.';
		throw new Error(message);
	}

	return data;
}

async function postStartRegistration(payload) {
	const response = await fetch('/register/start', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(payload)
	});

	const data = await parseJsonSafely(response);

	if (!response.ok) {
		const message = data.error || 'Failed to start registration. Please try again.';
		throw new Error(message);
	}

	return data;
}

async function postSendOtp(email) {
	const response = await fetch('/email/send', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ email })
	});

	const data = await parseJsonSafely(response);

	if (!response.ok) {
		const message = data.error || 'Failed to send OTP. Please try again.';
		throw new Error(message);
	}

	return data;
}

async function postVerifyOtp(email, otp) {
	const response = await fetch('/email/verify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ email, otp })
	});

	const data = await parseJsonSafely(response);

	if (!response.ok) {
		const message = data.error || 'OTP verification failed. Please try again.';
		throw new Error(message);
	}

	return data;
}

async function postVerifyRegistration(email, otp) {
	const response = await fetch('/register/verify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({ email, otp })
	});

	const data = await parseJsonSafely(response);

	if (!response.ok) {
		const message = data.error || 'OTP verification failed. Please try again.';
		throw new Error(message);
	}

	return data;
}

window.PhilTMSApi = {
	postRegister,
	postStartRegistration,
	postSendOtp,
	postVerifyOtp,
	postVerifyRegistration
};
