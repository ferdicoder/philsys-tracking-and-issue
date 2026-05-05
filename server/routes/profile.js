const express = require('express');
const router = express.Router();

const { getCurrentUser } = require('../controllers/userController');

router.get('/me', getCurrentUser);

module.exports = router;
