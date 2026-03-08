const { db } = require('../config/connectDB'); 

async function isUserFound(userEmail){
  const userFound = await db.query(`
    SELECT * 
    FROM users
    WHERE email = $1
  `, [userEmail]); 
  
  return userFound.rows.length > 0 ? true : false;
}

module.exports = { isUserFound }; 