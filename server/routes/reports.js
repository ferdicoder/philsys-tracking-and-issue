const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verify');

const {
  createReport,
  viewReports,
  viewUserReports,
  updateReport,
} = require('../controllers/reportsController');


router.post('/', verifyToken, createReport);

router.get('/me', verifyToken, viewUserReports);

router.get('/', verifyToken, viewReports);

router.put('/:reportId', verifyToken, updateReport);

module.exports = router;
