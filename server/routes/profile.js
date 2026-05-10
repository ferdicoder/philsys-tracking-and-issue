const express = require('express');
const router = express.Router();

const {
	getCurrentUser,
	updateTrackingNumber,
	getCurrentUserApplication
} = require('../controllers/userController');

router.get('/me', getCurrentUser);
router.patch('/trn', updateTrackingNumber);
router.get('/application', getCurrentUserApplication);

module.exports = router;
