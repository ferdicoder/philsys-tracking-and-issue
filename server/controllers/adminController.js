const {
  getAllApplicationsWithUserDetails,
  updateApplicationStatus
} = require('../services/userService');

// Get all applications with user details
async function listApplications(req, res) {
  try {
    const applications = await getAllApplicationsWithUserDetails();

    // Format the response to match admin frontend expectations
    const formattedApps = applications.map(app => ({
      application_id: app.application_id,
      trn: app.tracking_number || '',
      name: `${app.first_name || ''} ${app.middle_name || ''} ${app.last_name || ''}`.trim(),
      date: app.date_registered ? app.date_registered.toISOString().split('T')[0] : '',
      status: app.status || 'registered',
      current_location: app.current_location || '',
      email: app.email,
      user_id: app.user_id
    }));

    return res.status(200).json({
      success: true,
      data: formattedApps,
      total: formattedApps.length
    });
  } catch (error) {
    console.error('List applications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Update application status
async function updateStatus(req, res) {
  try {
    const { application_id, status } = req.body;

    if (!application_id) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await updateApplicationStatus(application_id, status);

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listApplications, updateStatus };
