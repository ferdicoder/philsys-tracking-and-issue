const jwt = require('jsonwebtoken'); 

const verifyToken = (req, res, next) => {
  const authHead = req.headers.authorization || req.headers.Authorization; 
  
  if(!authHead?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHead.split(' ')[1]; 
  
  jwt.verify(
    token, 
    process.env.ACCESS_TOKEN_SECRET, 
    (error, decoded) => {
      if(error) {
        return res.status(403).json({ error: 'Invalid or expired access token' });
      }

      if(!decoded?.email) {
        return res.status(401).json({ error: 'Token payload missing email' });
      }
      
      req.user = {
        email: decoded.email,
        roles: decoded.roles
      };
      
      next();
    }
  );
}

module.exports = verifyToken 