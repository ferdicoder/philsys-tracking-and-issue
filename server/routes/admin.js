const express = require('express');
const verifyToken = require('../middlewares/verify');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

router.get('/me', verifyToken, requireAdmin, (req, res) => {
  return res.status(200).json({
    email: req.user.email,
    role: req.user.roles || 'admin'
  });
});

module.exports = router;
