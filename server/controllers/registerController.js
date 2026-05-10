const bcrypt = require('bcrypt');
const crypto = require('node:crypto'); 
const jwt = require('jsonwebtoken'); 
const joi = require('joi');

const { checkUserExists, createUser } = require('../services/userService'); 
const { sendOtpEmail, verifyEmailOtp } = require('../services/otpService');
const {
  ensurePendingTable,
  cleanupExpiredPending,
  upsertPendingRegistration,
  getPendingByEmail,
  deletePendingByEmail
} = require('../services/pendingRegistrationService');
const roles = require('../config/roles'); 

/*
 * TODO:
 * Add roles
 * Change Refresh token to 1 day
 * increase user data validation 
*/

// generate refresh and access token
function generateTokens(email, roles = 'user'){
  const refreshToken = jwt.sign(
    { 
      email: email,
      roles: roles
    }, 
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  ); 

  const accessToken = jwt.sign(
    { 
      email: email,
      roles: roles
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  )
   
  return { accessToken, refreshToken };
}

// function generateTrackingNumber() {
//   const timestamp = Date.now().toString().slice(-8);
//   const random = crypto.randomInt(100000, 999999);
//   return `PTM-${timestamp}-${random}`;
// }

// validate registration input using joi
function validateInput (userData){
  const schema = joi.object({
    first_name: joi.string().trim().min(1).required(),
    last_name: joi.string().trim().min(1).required(),
    middle_name: joi.string().trim().allow('').optional(),
    suffix:  joi.string().trim().allow('').optional(),
    birth_date: joi.date().iso().required(),
    user_sex: joi.string().valid('male', 'female').required(),
    email: joi.string().email().required(), 
    password: joi.string().min(8).required(),
    mobile_no: joi.string().trim().min(11).required()
  }); 
  
  const { error, value } = schema.validate(userData); 
  if(error) return error;

  return value; 
}

// hash user sensitive data 
async function hashData(password, refreshToken){
  const hashedPassword = await bcrypt.hash(password, 10); 
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10); 

  return { hashedPassword, hashedRefreshToken }
}

async function hashPasswordOnly(password) {
  return bcrypt.hash(password, 10);
}

async function hashRefreshTokenOnly(refreshToken) {
  return bcrypt.hash(refreshToken, 10);
}

// create a record and insert into the database
async function createRecord(userData){

  // get user data
  const {
    first_name, 
    last_name,  
    middle_name, 
    suffix,
    birth_date, 
    user_sex, 
    email, 
    password, 
    mobile_no, 
    tracking_number,
    refresh_token = null,
    roles = 'user'
  } = userData; 

   // validate registration data
  const validationResult = validateInput({
    first_name,
    last_name,
    middle_name,
    suffix,
    birth_date,
    user_sex,
    email,
    password,
    mobile_no
  });
  if(validationResult && validationResult.details) {
    const error = new Error('Validation failed');
    error.type = 'VALIDATION_ERROR';
    throw error;
  } 

  const user_id = crypto.randomUUID(); // generate UUID

  const { accessToken, refreshToken } = generateTokens(email, roles);
  // hash user password and refresh token for the database 
  const { hashedPassword, hashedRefreshToken } = await hashData(password, refreshToken);
   
  // check if user exist
  const userExists = await checkUserExists(email);
  if(userExists) {
    const error = new Error('User already exists');
    error.type = 'USER_EXIST';
    throw error;
  } 
  
  // const tracking_number = generateTrackingNumber();

  // create user record using service
  await createUser({
    user_id,
    first_name,
    last_name,
    middle_name,
    suffix,
    birth_date,
    user_sex,
    email,
    hashedPassword,
    mobile_no,
    tracking_number,
    hashedRefreshToken,
    roles
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

// start registration: store pending record and send OTP
async function startRegistration(req, res) {
  if(!req?.body) return res.sendStatus(400);

  try {
    const {
      first_name,
      last_name,
      middle_name,
      suffix,
      birth_date,
      user_sex,
      email,
      password,
      mobile_no
    } = req.body;

    const validationResult = validateInput({
      first_name,
      last_name,
      middle_name,
      suffix,
      birth_date,
      user_sex,
      email,
      password,
      mobile_no
    });

    if(validationResult && validationResult.details) {
      return res.status(400).json({ error: 'Invalid Input' });
    }

    const userExists = await checkUserExists(email);
    if(userExists) {
      return res.status(409).json({ error: 'User already exist.' });
    }

    await ensurePendingTable();
    await cleanupExpiredPending();

    const passwordHash = await hashPasswordOnly(password);
    await upsertPendingRegistration({
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      first_name,
      last_name,
      middle_name,
      birth_date,
      user_sex,
      password_hash: passwordHash,
      mobile_no
    });

    await sendOtpEmail(email);

    return res.status(200).json({ message: 'OTP sent' });
  } catch (error) {
    console.error('Start registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// verify OTP and finalize registration
async function verifyRegistration(req, res) {
  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    await ensurePendingTable();
    await cleanupExpiredPending();

    const pending = await getPendingByEmail(email.toLowerCase());
    if (!pending) {
      return res.status(404).json({ error: 'Pending registration not found' });
    }

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await deletePendingByEmail(email.toLowerCase());
      return res.status(401).json({ error: 'Registration expired. Please start again.' });
    }

    const otpResult = await verifyEmailOtp(email, otp);
    if (!otpResult.ok) {
      return res.status(401).json({ error: otpResult.reason });
    }

    const userExists = await checkUserExists(email);
    if(userExists) {
      await deletePendingByEmail(email.toLowerCase());
      return res.status(409).json({ error: 'User already exist.' });
    }

    const { accessToken, refreshToken } = generateTokens(email, 'user');
    const hashedRefreshToken = await hashRefreshTokenOnly(refreshToken);
    const user_id = crypto.randomUUID();

    await createUser({
      user_id,
      first_name: pending.first_name,
      last_name: pending.last_name,
      middle_name: pending.middle_name,
      birth_date: pending.birth_date,
      user_sex: pending.user_sex,
      email: pending.email,
      hashedPassword: pending.password_hash,
      mobile_no: pending.mobile_no,
      tracking_number: null,
      hashedRefreshToken,
      roles: 'user'
    });

    await deletePendingByEmail(email.toLowerCase());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ user_id, accessToken });
  } catch (error) {
    console.error('Verify registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { handleRegister, generateTokens, startRegistration, verifyRegistration }