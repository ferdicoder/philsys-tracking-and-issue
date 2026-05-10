const express = require('express');
const {
  handleRegister,
  startRegistration,
  verifyRegistration
} = require('../controllers/registerController');

const router = express.Router();

router.post('/start', startRegistration);
router.post('/verify', verifyRegistration);
router.post('/', handleRegister);

module.exports = router;
