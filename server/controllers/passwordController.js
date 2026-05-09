const bcrypt = require('bcrypt');

const { checkUserExists, updateUserPassword } = require('../services/userService');
const { sendOtpEmail, verifyEmailOtp, verifyEmailOtpNoConsume } = require('../services/otpService');

const MIN_PASSWORD_LENGTH = 8;

function validateForgotPasswordInput(req) {
	if (!req?.body) {
		const error = new Error('Request body required');
		error.type = 'BAD_REQUEST';
		throw error;
	}

	const { email } = req.body;
	if (!email) {
		const error = new Error('Email is required');
		error.type = 'BAD_REQUEST';
		throw error;
	}

	return { email };
}

function validateVerifyOtpInput(req) {
	if (!req?.body) {
		const error = new Error('Request body required');
		error.type = 'BAD_REQUEST';
		throw error;
	}

	const { email, otp } = req.body;
	if (!email || !otp) {
		const error = new Error('Email and OTP are required');
		error.type = 'BAD_REQUEST';
		throw error;
	}

	return { email, otp };
}

function validateResetPasswordInput(req) {
	if (!req?.body) {
		const error = new Error('Request body required');
		error.type = 'BAD_REQUEST';
		throw error;
	}

	const { email, otp, newPassword } = req.body;
	if (!email || !otp || !newPassword) {
		const error = new Error('Email, OTP, and new password are required');
		error.type = 'BAD_REQUEST';
		throw error;
	}

	if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
		const error = new Error('Password must be at least 8 characters');
		error.type = 'BAD_REQUEST';
		throw error;
	}

	return { email, otp, newPassword };
}

async function sendForgotPasswordOtp(req, res) {
	try {
		const { email } = validateForgotPasswordInput(req);
		const userExists = await checkUserExists(email);

		if (!userExists) {
			return res.status(404).json({ error: 'Email not found' });
		}

		await sendOtpEmail(email);
		return res.status(200).json({ message: 'OTP sent' });
	} catch (error) {
		if (error.type === 'BAD_REQUEST') {
			return res.status(400).json({ error: error.message });
		}

		console.error('Forgot password OTP error:', error);
		return res.status(500).json({ error: 'Failed to send OTP' });
	}
}

async function verifyForgotPasswordOtp(req, res) {
	try {
		const { email, otp } = validateVerifyOtpInput(req);
		const userExists = await checkUserExists(email);

		if (!userExists) {
			return res.status(404).json({ error: 'Email not found' });
		}

		const otpResult = await verifyEmailOtpNoConsume(email, otp);
		if (!otpResult.ok) {
			return res.status(401).json({ error: otpResult.reason });
		}

		return res.status(200).json({ message: 'OTP verified' });
	} catch (error) {
		if (error.type === 'BAD_REQUEST') {
			return res.status(400).json({ error: error.message });
		}

		console.error('Verify forgot password OTP error:', error);
		return res.status(500).json({ error: 'Failed to verify OTP' });
	}
}

async function resetPassword(req, res) {
	try {
		const { email, otp, newPassword } = validateResetPasswordInput(req);
		const userExists = await checkUserExists(email);

		if (!userExists) {
			return res.status(404).json({ error: 'Email not found' });
		}

		const otpResult = await verifyEmailOtp(email, otp);
		if (!otpResult.ok) {
			return res.status(401).json({ error: otpResult.reason });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		const updated = await updateUserPassword(email, hashedPassword);

		if (!updated) {
			return res.status(404).json({ error: 'User not found' });
		}

		return res.status(200).json({ message: 'Password reset successful' });
	} catch (error) {
		if (error.type === 'BAD_REQUEST') {
			return res.status(400).json({ error: error.message });
		}

		console.error('Reset password error:', error);
		return res.status(500).json({ error: 'Failed to reset password' });
	}
}

module.exports = {
	sendForgotPasswordOtp,
	verifyForgotPasswordOtp,
	resetPassword
};
