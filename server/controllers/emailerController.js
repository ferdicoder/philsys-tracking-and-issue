const { sendOtpEmail, verifyEmailOtp } = require('../services/otpService');
const { generateTokens } = require('./registerController');
const { getUserRoleByEmail } = require('../services/userService');

async function sendOtp(req, res) {
	const { email } = req.body || {};
	if (!email) {
		return res.status(400).json({ error: 'Email is required' });
	}

	try {
		const role = await getUserRoleByEmail(email.toLowerCase());
		const isAdmin = role === 'admin' || role === 1;
		if (!isAdmin) {
			return res.status(403).json({ error: 'Admin access required' });
		}

		await sendOtpEmail(email);

		return res.status(200).json({ message: 'OTP sent' });
	} catch (error) {
		if (error.type === 'NOT_FOUND') {
			return res.status(404).json({ error: error.message });
		}

		console.error('OTP email error:', error);
		return res.status(500).json({ error: 'Failed to send OTP' });
	}
}

async function confirmOtp(req, res) {
	const { email, otp } = req.body || {};
	if (!email || !otp) {
		return res.status(400).json({ error: 'Email and OTP are required' });
	}

	const result = await verifyEmailOtp(email, otp);
	if (!result.ok) {
		return res.status(401).json({ error: result.reason });
	}

	try {
		const role = await getUserRoleByEmail(email.toLowerCase());
		const isAdmin = role === 'admin' || role === 1;
		if (!isAdmin) {
			return res.status(403).json({ error: 'Admin access required' });
		}

		const { accessToken } = generateTokens(email.toLowerCase(), 'admin');
		return res.status(200).json({
			message: 'OTP verified',
			accessToken,
			role: 'admin'
		});
	} catch (error) {
		if (error.type === 'NOT_FOUND') {
			return res.status(404).json({ error: error.message });
		}

		console.error('OTP admin verify error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

module.exports = {
	sendOtp,
	confirmOtp
};
