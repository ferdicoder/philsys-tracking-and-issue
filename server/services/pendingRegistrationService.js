const { db } = require('../config/connectDB');

const PENDING_TTL_MS = 15 * 60 * 1000;
let pendingTableReady = null;

function ensurePendingTable() {
	if (!pendingTableReady) {
		pendingTableReady = db.query(
			`CREATE TABLE IF NOT EXISTS pending_registrations (
				id UUID PRIMARY KEY,
				email VARCHAR(255) NOT NULL,
				first_name VARCHAR(255) NOT NULL,
				last_name VARCHAR(255) NOT NULL,
				middle_name VARCHAR(255),
				birth_date DATE NOT NULL,
				user_sex VARCHAR(16) NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				mobile_no VARCHAR(255) NOT NULL,
				expires_at TIMESTAMPTZ NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`
		);
	}

	return pendingTableReady;
}

async function cleanupExpiredPending() {
	await db.query('DELETE FROM pending_registrations WHERE expires_at < NOW()');
}

async function upsertPendingRegistration(pending) {
	const {
		id,
		email,
		first_name,
		last_name,
		middle_name,
		birth_date,
		user_sex,
		password_hash,
		mobile_no
	} = pending;

	const expiresAt = new Date(Date.now() + PENDING_TTL_MS);

	await db.query('DELETE FROM pending_registrations WHERE email = $1', [email]);
	await db.query(
		`INSERT INTO pending_registrations (
			id,
			email,
			first_name,
			last_name,
			middle_name,
			birth_date,
			user_sex,
			password_hash,
			mobile_no,
			expires_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		[
			id,
			email,
			first_name,
			last_name,
			middle_name,
			birth_date,
			user_sex,
			password_hash,
			mobile_no,
			expiresAt
		]
	);
}

async function getPendingByEmail(email) {
	const result = await db.query(
		`SELECT
			id,
			email,
			first_name,
			last_name,
			middle_name,
			birth_date,
			user_sex,
			password_hash,
			mobile_no,
			expires_at
		FROM pending_registrations
		WHERE email = $1
		ORDER BY created_at DESC
		LIMIT 1`,
		[email]
	);

	return result.rows[0] || null;
}

async function deletePendingByEmail(email) {
	await db.query('DELETE FROM pending_registrations WHERE email = $1', [email]);
}

module.exports = {
	ensurePendingTable,
	cleanupExpiredPending,
	upsertPendingRegistration,
	getPendingByEmail,
	deletePendingByEmail
};
