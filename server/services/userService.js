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
    sex,
    email,
    hashedPassword,
    mobile_no,
    tracking_number,
    hashedRefreshToken
  } = userData;

  await db.query(
    `INSERT INTO users (
      user_id,
      first_name, 
      last_name, 
      middle_name, 
      birth_date,
      sex, 
      email, 
      password,
      mobile_no, 
      tracking_number,
      refresh_token
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [user_id, first_name, last_name, middle_name, birth_date, sex, email, hashedPassword, mobile_no, tracking_number, hashedRefreshToken]
  );
}



module.exports = { checkUserExists, createUser };
