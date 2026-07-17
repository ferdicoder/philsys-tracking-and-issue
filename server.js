require('dotenv').config();
const path = require('path'); 
const express = require('express'); 
const app = express(); 
const cors = require('cors');

//middleswares
const { db , connectDatabase } = require('./server/config/connectDB'); 

const PORT = process.env.PORT; 

app.use(express.static(path.join(__dirname, 'client'))); 
app.use(express.json());
app.use(cors());

async function startServer(){
  try{

    app.listen(PORT, ()=>{
      console.log(`Server running to PORT: ${PORT}`)
    }); 

    app.use('/register', require('./server/routes/register')); 
    app.use('/login', require('./server/routes/login')); 
    app.use('/email', require('./server/routes/email'));
    app.use('/admin', require('./server/routes/admin'));
    app.use('/password', require('./server/routes/password'));
    app.use('/dashboard', require('./server/routes/dashboard'));
    app.use(require('./server/middlewares/verify'));
    app.use('/user', require('./server/routes/profile'));
    app.use('/reports', require('./server/routes/reports'));

    await connectDatabase(); 
    
  }catch(error){
    console.error(error); 
  }
}

startServer(); 