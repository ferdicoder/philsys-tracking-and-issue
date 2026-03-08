const { db } = require('../config/connectDB'); 
const jwt = require('jsonwebtoken'); 

const verifyToken = (req, res, next) => {
  const authHead = req.headers.authorization || req.headers.Authorization; 
  
  if(!authHead?.startsWith('Bearer ')) return res.sendStatus(401); 

  const token = authHead.split(' ')[1]; 
  
  jwt.verify(
    token, 
    process.env.ACCESS_TOKEN_SECRET, 
    (error, decoded) => {
      if(error) return res.sendStatus(403); 
      
      req.user = {
        email: decoded.email,
      };
      
      next();
    }
  );
}

module.exports = { verifyToken };