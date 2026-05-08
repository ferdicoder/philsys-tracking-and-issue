const crypto = require('node:crypto');
const nodemailer = require('nodemailer');
const { db } = require('../config/connectDB');

const OTP_TTL_MS = 10 * 60 * 1000;
let otpTableReady = null;

function createTransporter() {
	return nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		}
	});
}

function generateOtp() {
	return String(crypto.randomInt(100000, 1000000));
}

function ensureOtpTable() {
	if (!otpTableReady) {
		otpTableReady = db.query(
			`CREATE TABLE IF NOT EXISTS email_otps (
				id SERIAL PRIMARY KEY,
				email VARCHAR(255) NOT NULL,
				otp VARCHAR(6) NOT NULL,
				expires_at TIMESTAMPTZ NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`
		);
	}

	return otpTableReady;
}

async function cleanupExpiredOtps() {
	await db.query('DELETE FROM email_otps WHERE expires_at < NOW()');
}

async function setOtp(email, otp) {
	const normalizedEmail = email.toLowerCase();
	const expiresAt = new Date(Date.now() + OTP_TTL_MS);

	await db.query('DELETE FROM email_otps WHERE email = $1', [normalizedEmail]);
	await db.query(
		'INSERT INTO email_otps (email, otp, expires_at, created_at) VALUES ($1, $2, $3, NOW())',
		[normalizedEmail, otp, expiresAt]
	);
}

async function verifyOtp(email, otp) {
	const normalizedEmail = email.toLowerCase();
	const result = await db.query(
		`SELECT otp, expires_at
		 FROM email_otps
		 WHERE email = $1
		 ORDER BY created_at DESC
		 LIMIT 1`,
		[normalizedEmail]
	);

	if (result.rows.length === 0) {
		return { ok: false, reason: 'OTP not found' };
	}

	const record = result.rows[0];
	if (new Date(record.expires_at).getTime() < Date.now()) {
		await db.query('DELETE FROM email_otps WHERE email = $1', [normalizedEmail]);
		return { ok: false, reason: 'OTP expired' };
	}

	if (record.otp !== otp) {
		return { ok: false, reason: 'Invalid OTP' };
	}

	await db.query('DELETE FROM email_otps WHERE email = $1', [normalizedEmail]);
	return { ok: true };
}

async function sendOtpEmail(email) {
	await ensureOtpTable();
	await cleanupExpiredOtps();

	const transporter = createTransporter();
	const otp = generateOtp();
	await setOtp(email, otp);

	await transporter.sendMail({
		from: process.env.SMTP_USER,
		to: email,
		subject: 'Your PhilTMS verification code',
		text: `Your verification code is ${otp}. It expires in 10 minutes.`
	});
}

async function verifyEmailOtp(email, otp) {
	await ensureOtpTable();
	await cleanupExpiredOtps();
	return verifyOtp(email, otp);
}

module.exports = {
	sendOtpEmail,
	verifyEmailOtp,
	cleanupExpiredOtps,
	ensureOtpTable
};
