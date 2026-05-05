const { db } = require('../config/connectDB');

async function getUser(email){
	const result = await db.query(`
		SELECT user_id
		FROM users
		WHERE email = $1
	`, [email]);

	if(result.rows.length === 0){
		const error = new Error('User does not exist');
		error.type = 'NOT_FOUND';
		throw error;
	}

	return result.rows[0].user_id;
}

async function isAdmin(email){
	const result = await db.query(`
		SELECT roles
		FROM users
		WHERE email = $1
	`, [email]);

	if(result.rows.length === 0){
		const error = new Error('User does not exist');
		error.type = 'NOT_FOUND';
		throw error;
	}

	const roleValue = result.rows[0].roles;
	return roleValue === 'admin' || roleValue === 1;
}

async function createReportRecord(reportData){
	const { reportId, userId, reportContent, status } = reportData;

	const result = await db.query(`
		INSERT INTO reports (
			report_id,
			user_id,
			report_content,
			status,
			created_at
		) VALUES ($1, $2, $3, $4, NOW())
		RETURNING report_id, user_id, report_content, status, created_at, updated_at
	`, [reportId, userId, reportContent, status,]);

	return result.rows[0];
}

// use pagination
async function getAllReports(){
	const result = await db.query(`
		SELECT
			r.report_id,
			r.user_id,
			u.email,
			r.report_content,
			r.status,
			r.created_at,
		FROM reports r
		JOIN users u ON u.user_id = r.user_id
		ORDER BY r.created_at DESC
	`);

	return result.rows;
}

module.exports = { getUser, isAdmin, createReportRecord, getAllReports };
