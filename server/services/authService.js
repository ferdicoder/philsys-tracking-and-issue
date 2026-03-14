const { db } = require('../config/connectDB');

// Get user password data for authentication
async function getUserData(email) {
  const result = await db.query(`
    SELECT id, password 
    FROM users
    WHERE email = $1
  `, [email]);

  if (result.rows.length === 0) {
    const error = new Error('User is not found');
    error.type = 'USER_NOT_EXIST';
    throw error;
  }

  return result.rows[0];
}


// Store refresh token for user
async function insertRefreshToken(refreshToken, email) {
  await db.query(`
    UPDATE users
    SET refresh_token = $1
    WHERE email = $2
  `, [refreshToken, email]);
}

module.exports = { getUserData, isUserFound, insertRefreshToken };
