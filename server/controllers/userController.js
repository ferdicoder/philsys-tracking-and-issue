const { getUserProfileByEmail } = require('../services/userService');

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

module.exports = { getCurrentUser };
