const { handleRegister } = require('../../controllers/registerController'); 
const express = require('express'); 
const router = express().Router();

router.post('/register', handleRegister); 
