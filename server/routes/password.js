const express = require('express');
const {
	sendForgotPasswordOtp,
	verifyForgotPasswordOtp,
	resetPassword
} = require('../controllers/passwordController');

const router = express.Router();

router.post('/forgot/send', sendForgotPasswordOtp);
router.post('/forgot/verify', verifyForgotPasswordOtp);
router.post('/forgot/reset', resetPassword);

module.exports = router;
