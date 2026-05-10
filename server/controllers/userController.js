const crypto = require('node:crypto');
const {
  getUserProfileByEmail,
  updateTrackingNumberByEmail,
  getLatestApplicationByUserId,
  createApplicationForUserId
} = require('../services/userService');

async function getCurrentUser(req, res) {
  try {
    const email = req?.user?.email;
    if (!email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserProfileByEmail(email);

    return res.status(200).json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      birth_date: user.birth_date,
      email: user.email,
      mobile_no: user.mobile_no,
      tracking_number: user.tracking_number,
      role: user.roles
    });
  } catch (error) {
    if (error.type === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }

    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateTrackingNumber(req, res) {
  try {
    const email = req?.user?.email;
    const trackingNumber = req?.body?.tracking_number;

    if (!email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!trackingNumber || !String(trackingNumber).trim()) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    const updated = await updateTrackingNumberByEmail(email, String(trackingNumber).trim());
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await getUserProfileByEmail(email);
    const latestApplication = await getLatestApplicationByUserId(user.user_id);

    if (!latestApplication) {
      const applicationId = crypto.randomUUID();
      await createApplicationForUserId(user.user_id, applicationId);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update tracking number error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCurrentUserApplication(req, res) {
  try {
    const email = req?.user?.email;
    if (!email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserProfileByEmail(email);
    const application = await getLatestApplicationByUserId(user.user_id);

    if (!application) {
      return res.status(200).json({ status: null });
    }

    return res.status(200).json({
      application_id: application.application_id,
      status: application.status,
      current_location: application.current_location,
      date_registered: application.date_registered
    });
  } catch (error) {
    if (error.type === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }

    console.error('Get application status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getCurrentUser, updateTrackingNumber, getCurrentUserApplication };
