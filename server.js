require('dotenv').config();
const path = require('path'); 
const express = require('express'); 
const app = express(); 

//middleswares
const { db , connectDatabase } = require('./server/config/connectDB'); 

const PORT = process.env.PORT; 

app.use(express.static(path.join(__dirname, 'client'))); 
app.use(express.json());


async function startServer(){
  try{

    app.listen(PORT, ()=>{
      console.log(`Server running to PORT: ${PORT}`)
    }); 

    app.use('/register', require('./server/routes/user')); 
    app.use('/login', require('./server/routes/login')); 
    app.use('/email', require('./server/routes/email'));
    app.use(require('./server/middlewares/verify'));
    app.use('/user', require('./server/routes/profile'));
    app.use('/reports', require('./server/routes/reports'));

    await connectDatabase(); 
    
  }catch(error){
    console.error(error); 
  }
}

startServer(); 