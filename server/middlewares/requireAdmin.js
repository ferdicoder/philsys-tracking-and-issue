const { getUserRoleByEmail } = require('../services/userService');

function isAdminRole(role) {
  return role === 'admin' || role === 1;
}

async function requireAdmin(req, res, next) {
  try {
    const tokenRole = req?.user?.roles;
    if (isAdminRole(tokenRole)) {
      return next();
    }

    const email = req?.user?.email;
    if (!email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dbRole = await getUserRoleByEmail(email);
    if (!isAdminRole(dbRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user.roles = dbRole;
    return next();
  } catch (error) {
    if (error.type === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }

    console.error('Require admin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = requireAdmin;
