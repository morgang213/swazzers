const { verifyAccessToken } = require('../utils/jwt');
const db = require('../config/database');

/**
 * Authenticate user with JWT token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists and is active
    const user = await db('users')
      .where({ id: decoded.userId, active: true })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      agencyId: decoded.agencyId,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Authorize based on role
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

/**
 * Ensure request is scoped to user's agency
 */
function ensureAgencyScope(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Add agency filter to all queries
  req.agencyId = req.user.agencyId;
  
  next();
}

module.exports = {
  authenticate,
  authorize,
  ensureAgencyScope
};
