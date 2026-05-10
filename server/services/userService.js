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


module.exports = {
  checkUserExists,
  createUser,
  getUserProfileByEmail,
  getUserRoleByEmail,
  updateUserPassword
};
