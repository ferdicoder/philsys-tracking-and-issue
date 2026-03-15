const { handleLogin } = require('../controllers/loginController'); 
const router = require('express').Router(); 

router.post('/', handleLogin); 

module.exports = router; 