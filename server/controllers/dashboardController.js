const { getDashboardSnapshot } = require('../services/dashboardService');

async function getDashboard(req, res) {
  try {
    const data = getDashboardSnapshot();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Dashboard snapshot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getDashboard };