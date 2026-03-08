require('dotenv').config(); 
const bcrypt = require('bcrypt'); 

const { db } = require('../config/connectDB');
const { isUserFound } = require('../utils/isUserFound'); 
const { generateTokens } = require('./registerController'); 


async function getUserData(email){
  const result = await db.query(`
    SELECT password 
    FROM users
    WHERE email = $1
  `, [email]); 
  
  if(result.rows.length === 0) {
    const error = new Error('User is not found');
    error.type = 'USER_NOT_EXIST'; 
    throw error;
  }
  
  return result.rows[0];
}



async function insertRefreshToken (refreshToken, email){
  await db.query(`
    UPDATE users
    SET refresh_token = $1
    WHERE email = $2
  `, [refreshToken, email]);
}



async function validateUserCredentials(email, password) {
  const user = await isUserFound(email);
  
  if(!user){
    const error = new Error('User does not exist');
    error.type = 'NOT_FOUND';
    throw error;
  }

  const userData = await getUserData(email);
  const passwordMatched = await bcrypt.compare(password, userData.password);
  
  if(!passwordMatched){
    const error = new Error('Invalid password');
    error.type = 'INVALID_CREDENTIALS';
    throw error;
  }

  return userData;
}



function validateLoginInput(req) {
  if(!req?.body) {
    const error = new Error('Request body required');
    error.type = 'BAD_REQUEST';
    throw error;
  }
  
  const { email, password } = req.body;
  
  if(!email || !password) {
    const error = new Error('Email and password are required');
    error.type = 'BAD_REQUEST';
    throw error;
  }
  
  return { email, password };
}



async function createUserSession(email, res) {
  const { accessToken, refreshToken } = await generateTokens(email);
  
  await insertRefreshToken(refreshToken, email);

  // Set refresh token to http-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return { accessToken };
}



async function handleLogin(req, res){
  try{
    // Validate input
    const { email, password } = validateLoginInput(req);
    
    // Validate user credentials and get user data
    const userData = await validateUserCredentials(email, password);
    
    // Create user session (tokens and cookie)
    const { accessToken } = await createUserSession(email, res);
    
    // Return successful response
    return res.status(200).json({ 
      user_id: userData.id, 
      accessToken
    }); 

  } catch(error) {
    // Handle different error types
    if(error.type === 'BAD_REQUEST') return res.status(400).json({ error: error.message });
    
    if(error.type === 'INVALID_CREDENTIALS') return res.status(401).json({ error: error.message });
    
    if(error.type === 'NOT_FOUND') return res.status(404).json({ error: error.message });
   
    if(error.type === 'USER_NOT_EXIST') return res.status(404).json({ error: error.message });
    
    // Fallback for unexpected errors
    console.error('Unexpected login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { handleLogin }; 