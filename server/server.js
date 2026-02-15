require('dotenv').config();
const path = require('path'); 
const express = require('express'); 
const app = express(); 

const PORT = process.env.PORT || 5000; 

app.use(express.static(path.join(__dirname, 'client', 'pages'))); 
app.use(express.json()); 

app.listen(PORT, ()=>{
  console.log(`Server running on PORT: ${PORT}`)
}); 