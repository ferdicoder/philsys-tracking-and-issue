const express = require('express');
const router = express.Router();

const { getDashboard } = require('../controllers/dashboardController');
const verifyToken = require('../middlewares/verify');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/', verifyToken, requireAdmin, getDashboard);

module.exports = router;