const { db } = require('../config/connectDB'); 
const bcrypt = require('bcrypt');
const crypto = require('node:crypto'); 
const jwt = require('jsonwebtoken'); 
const joi = require('joi'); 

/*
 * TODO:
 * Add roles
 * Change Refresh token to 1 day
 * increase user data validation 
*/

// generate refresh and access token
function generateTokens(email){
  const refreshToken = jwt.sign(
    { email: email }, 
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '5m' }
  ); 

  const accessToken = jwt.sign(
    { email: email }, 
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '5m' }
  )
   
  return { accessToken, refreshToken };
}

// validate the email and password using joi
function validateInput (email, password){
  const schema = joi.object({
    email: joi.string().email().required(), // user email format 
    password: joi.string().min(8).required(), // password with min 8 characters
  }); 
  
  const { error, value } = schema.validate({ email, password }); 
  if(error) return error;

  return value; 
}

// hash user sensitivev data 
async function hashData(password, refreshToken){
  const hashedPassword = await bcrypt.hash(password, 10); 
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10); 

  return { hashedPassword, hashedRefreshToken }
}

// create a record and insert into the database
async function createRecord(userData){

  // get user data
  const {
    first_name, 
    last_name,  
    middle_name, 
    birth_date, 
    sex, 
    email, 
    password, 
    mobile_no, 
    tracking_number, 
    refresh_token = null
  } = userData; 

   // validate email and password
  const validationResult = validateInput(email, password);
  if(validationResult && validationResult.details) {
    const error = new Error('Validation failed');
    error.type = 'VALIDATION_ERROR';
    throw error;
  } 

  const user_id = crypto.randomUUID(); // generate UUID

  const { accessToken, refreshToken } = generateTokens(user_id, email); // generate tokens  using user_id and email of user
  // hash user password and refresh token for the database 
  const { hashedPassword, hashedRefreshToken } = await hashData(password, refreshToken);
   
  //checks if user exist
  const foundUser = await db.query('SELECT * FROM users WHERE email = $1', [email]); 
  // if returns an record it means user already exist
  if(foundUser.rows.length > 0) {
    const error = new Error('User already exists');
    error.type = 'USER_EXIST';
    throw error;
  } 
  
  // insert user record using SQL 
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
  
  return { refreshToken, user_id, accessToken };
}


// registration of new user
async function handleRegister(req, res){
  if(!req?.body) return res.sendStatus(400); 

  try{
    const {refreshToken, user_id, accessToken} = await createRecord(req.body); 

    // set refersh token to http
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: 'strict', 
      maxAge: 7 * 24 * 60 * 60 * 1000
    }); 
    
    // return user and access token
    return res.status(201).json({ 
      user_id, 
      accessToken
    }); 
  }catch(error){
    // Log the actual error for debugging
    console.error('Registration error:', error);
    
    // return response status and message by its error type
    if(error.type === 'VALIDATION_ERROR') return res.status(400).json({ error: "Invalid Input"}); 
    if(error.type === 'USER_EXIST') return res.status(409).json({ error: "User already exist."}); 

    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}

module.exports = { handleRegister, generateTokens }