const bcrypt = require('bcrypt');
const crypto = require('node:crypto'); 
const jwt = require('jsonwebtoken'); 
const joi = require('joi');

const { checkUserExists, createUser } = require('../services/userService'); 
const roles = require('../config/roles'); 

/*
 * TODO:
 * Add roles
 * Change Refresh token to 1 day
 * increase user data validation 
*/

// generate refresh and access token
function generateTokens(email){
  const refreshToken = jwt.sign(
    { 
      email: email,
      roles: user
    }, 
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  ); 

  const accessToken = jwt.sign(
    { 
      email: email,
      roles: user
    },
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

// hash user sensitive data 
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
    refresh_token = null,
    roles = 'user'
  } = userData; 

   // validate email and password
  const validationResult = validateInput(email, password);
  if(validationResult && validationResult.details) {
    const error = new Error('Validation failed');
    error.type = 'VALIDATION_ERROR';
    throw error;
  } 

  const user_id = crypto.randomUUID(); // generate UUID

  const { accessToken, refreshToken } = generateTokens(email);
  // hash user password and refresh token for the database 
  const { hashedPassword, hashedRefreshToken } = await hashData(password, refreshToken);
   
  // check if user exist
  const userExists = await checkUserExists(email);
  if(userExists) {
    const error = new Error('User already exists');
    error.type = 'USER_EXIST';
    throw error;
  } 
  
  // create user record using service
  await createUser({
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
  });
  
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