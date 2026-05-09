const { sendOtpEmail, verifyEmailOtp } = require('../services/otpService');

async function sendOtp(req, res) {
	const { email } = req.body || {};
	if (!email) {
		return res.status(400).json({ error: 'Email is required' });
	}

	try {
		await sendOtpEmail(email);

		return res.status(200).json({ message: 'OTP sent' });
	} catch (error) {
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

	return res.status(200).json({ message: 'OTP verified' });
}

module.exports = {
	sendOtp,
	confirmOtp
};
