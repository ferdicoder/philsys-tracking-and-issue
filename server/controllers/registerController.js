const { db } = require('../config/connectDB'); 
const bcrypt = require('bcrypt');
const crypto = require('node:crypto'); 
const jwt = require('jsonwebtoken'); 


async function handleRegister(req, res){
  if(!req?.body) return res.sendStatus(400); 
  
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
  } = req.body
  
  const refreshToken = jwt.sign(
    {
      user_id: user_id, 
      email: email
    }, 
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '5m' }
  ); 

  const accessToken = jwt.sign(
    {
      user_id: user_id, 
      email: email
    }, 
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '5m' }
  )
  try{
    const user_id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, 10); 
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10); 

    const foundUser = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]); 
    if(foundUser) return res.status(202).json({ message: "User Already Exist"}); 
    
    const newUser = db.query(
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
      ) VALUES ($1, $2, $3, $4, $5, $7, $8, $9)`, 
      [user_id, first_name, last_name, middle_name, birth_date, sex, email, hashedPassword, mobile_no, tracking_number, refresh_token]
    );

    res.cookies(refreshToken, {
      httpOnly: true, 
      secure: true, 
      sameSite: 'strict', 
      maxAge: 7 * 24 * 60 * 60 * 1000
    }); 
    
    
    return res.status(201).json({ 
      user_id, 
      accessToken
    }); 
  }catch(error){
    console.log(error); 
    return res.sendStatus(500); 
  }
}

module.exports = { handleRegister }