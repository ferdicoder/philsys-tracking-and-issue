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
	const { reportId, userId, reportContent, status, type } = reportData;

	const result = await db.query(`
		INSERT INTO reports (
			report_id,
			user_id,
			report_content,
			status,
			type,
			created_at
		) VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING report_id, user_id, report_content, status, type, created_at
	`, [reportId, userId, reportContent, status, type]);

	return result.rows[0];
}

// use pagination
async function getAllReports(){
	const result = await db.query(`
		SELECT
			r.report_id,
			r.user_id,
			u.email,
			u.tracking_number,
			u.first_name,
			u.last_name,
			r.report_content,
			r.status,
			r.type,
			r.created_at
		FROM reports r
		JOIN users u ON u.user_id = r.user_id
		ORDER BY r.created_at DESC
	`);

	return result.rows;
}

async function updateReportStatus(reportId, status){
	const result = await db.query(`
		UPDATE reports
		SET status = $1
		WHERE report_id = $2
		RETURNING report_id, user_id, report_content, status, type, created_at
	`, [status, reportId]);

	return result.rows[0] || null;
}

async function getReportsByUserId(userId){
	const result = await db.query(`
		SELECT
			r.report_id,
			r.report_content,
			r.status,
			r.type,
			r.created_at
		FROM reports r
		WHERE r.user_id = $1
		ORDER BY r.created_at DESC
	`, [userId]);

	return result.rows;
}

module.exports = { getUser, isAdmin, createReportRecord, getAllReports, updateReportStatus, getReportsByUserId };
