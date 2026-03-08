require('dotenv').config();
const path = require('path'); 
const express = require('express'); 
const app = express(); 

//middleswares
const { db , connectDatabase } = require('./server/config/connectDB'); 

const PORT = process.env.PORT; 

app.use(express.static(path.join(__dirname, 'client', 'public'))); 
app.use(express.json());


try{
  // register route
  app.use('/register', require('./server/routes/user')); 
  app.use('/login', require('./server/routes/login')); 
  app.use(require('./server/middlewares/verify'));

  await connectDatabase(); 

  app.listen(PORT, ()=>{
    console.log(`Server running to PORT: ${PORT}`)
  }); 
  
}catch(error){
  
}
