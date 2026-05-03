const express = require('express');
const router = express.Router();

const {
  createReport,
  viewReports,
} = require('../controllers/reportsController');



router.post('/', createReport);

router.get('/', viewReports);

module.exports = router;
