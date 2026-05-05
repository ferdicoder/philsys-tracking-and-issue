const express = require('express');
const { sendOtp, confirmOtp } = require('../controllers/emailerController');

const router = express.Router();

router.post('/send', sendOtp);
router.post('/verify', confirmOtp);

module.exports = router;
