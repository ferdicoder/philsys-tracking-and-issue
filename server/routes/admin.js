const express = require('express');
const verifyToken = require('../middlewares/verify');
const requireAdmin = require('../middlewares/requireAdmin');
const { listApplications, updateStatus } = require('../controllers/adminController');

const router = express.Router();

router.get('/me', verifyToken, requireAdmin, (req, res) => {
  return res.status(200).json({
    email: req.user.email,
    role: req.user.roles || 'admin'
  });
});

// Get all applications
router.get('/applications', verifyToken, requireAdmin, listApplications);

// Update application status
router.patch('/applications/:application_id', verifyToken, requireAdmin, updateStatus);

module.exports = router;
