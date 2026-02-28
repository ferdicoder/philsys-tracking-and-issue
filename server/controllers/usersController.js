const { db } = require('../config/connectDB'); 

async function getUser(req ,res){
  if(!req?.body?.id) return res.sendStatus(400);
  
  try{
    const user_id = req.body.id; 
    const user = db.query('SELECT * FROM users WHERE user_id = $1', [user_id])
    if(!user) return res.sendStatus(404); 
    
    return res.status(200).json({ user }); 
  }catch(error){
    console.log(error); 
    return res.sendStatus(500);
  }
}
