const { db } = require('../config/connectDB');

// Check if user already exists
async function checkUserExists(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length > 0;
}

// Create new user record in database
async function createUser(userData) {
  const {
    user_id,
    first_name,
    last_name,
    middle_name,
    birth_date,
    user_sex,
    email,
    hashedPassword,
    mobile_no,
    tracking_number,
    hashedRefreshToken,
    roles,
  } = userData;

  await db.query(
    `INSERT INTO users (
      user_id,
      first_name, 
      last_name, 
      middle_name, 
      birth_date,
      user_sex, 
      email, 
      password,
      mobile_no, 
      tracking_number,
      refresh_token,
      roles
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [user_id, first_name, last_name, middle_name, birth_date, user_sex, email, hashedPassword, mobile_no, tracking_number, hashedRefreshToken, roles]
  );
}

// Get user profile data by email
async function getUserProfileByEmail(email) {
  const result = await db.query(
    `SELECT
      user_id,
      first_name,
      last_name,
      middle_name,
      birth_date,
      email,
      mobile_no,
      tracking_number,
      roles
    FROM users
    WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error('User does not exist');
    error.type = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0];
}

async function getUserRoleByEmail(email) {
  const result = await db.query(
    `SELECT roles
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error('User does not exist');
    error.type = 'NOT_FOUND';
    throw error;
  }

  return result.rows[0].roles;
}

async function updateUserPassword(email, hashedPassword) {
  const result = await db.query(
    'UPDATE users SET password = $1 WHERE email = $2',
    [hashedPassword, email]
  );

  return result.rowCount > 0;
}

async function updateTrackingNumberByEmail(email, trackingNumber) {
  const result = await db.query(
    'UPDATE users SET tracking_number = $1 WHERE email = $2',
    [trackingNumber, email]
  );

  return result.rowCount > 0;
}

async function getLatestApplicationByUserId(userId) {
  const result = await db.query(
    `SELECT application_id, status, current_location, date_registered
     FROM applications
     WHERE user_id = $1
     ORDER BY date_registered DESC
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function createApplicationForUserId(userId, applicationId) {
  const result = await db.query(
    `INSERT INTO applications (application_id, user_id, date_registered)
     VALUES ($1, $2, CURRENT_DATE)`,
    [applicationId, userId]
  );

  return result.rowCount > 0;
}

// Get all applications with user details for admin
async function getAllApplicationsWithUserDetails() {
  const result = await db.query(
    `SELECT
      a.application_id,
      a.status,
      a.current_location,
      a.date_registered,
      u.user_id,
      u.tracking_number,
      u.first_name,
      u.last_name,
      u.middle_name,
      u.email
    FROM applications a
    JOIN users u ON a.user_id = u.user_id
    ORDER BY a.date_registered DESC`
  );

  return result.rows;
}

// Update application status by application_id
async function updateApplicationStatus(applicationId, newStatus) {
  const result = await db.query(
    'UPDATE applications SET status = $1 WHERE application_id = $2',
    [newStatus, applicationId]
  );

  return result.rowCount > 0;
}


module.exports = {
  checkUserExists,
  createUser,
  getUserProfileByEmail,
  getUserRoleByEmail,
  updateUserPassword,
  updateTrackingNumberByEmail,
  getLatestApplicationByUserId,
  createApplicationForUserId,
  getAllApplicationsWithUserDetails,
  updateApplicationStatus
};
