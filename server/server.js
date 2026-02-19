require('dotenv').config();
const path = require('path'); 
const express = require('express'); 
const app = express(); 

const { db } = require('./config/connectDB')

const PORT = process.env.PORT; 

app.use(express.static(path.join(__dirname, 'client', 'public'))); 
app.use(express.json()); 

// confirmation of connection to DATABASE and Server
db.query('SELECT NOW()', (err, res)=>{
  if(err) return console.log(`Database Connection Failed ${err}`); 

  app.listen(PORT, ()=>{
    console.log(`Server running to PORT: ${PORT}`)
  }); 
  console.log(`Database Connected to PORT: ${process.env.DB_PORT}`)
});   