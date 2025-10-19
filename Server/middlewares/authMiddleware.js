// Small, robust JWT authentication + admin authorization middleware.
// Usage: const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

const jwt = require('jsonwebtoken');

function extractTokenFromHeader(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!authHeader) return null;
  // Accept "Bearer <token>" or raw token
  if (authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return authHeader;
}

function authenticateToken(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    // verify token (throws on invalid/expired)
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // normalize common fields
    if (payload && payload.email && typeof payload.email === 'string') {
      payload.email = payload.email.toLowerCase().trim();
    }

    // attach user payload for downstream routes
    req.user = payload; // expected fields: userId, email, role, iat, exp
    return next();
  } catch (err) {
    console.error('authenticateToken error:', err && err.message ? err.message : err);
    if (err && err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired' });
    }
    return res.status(403).json({ success: false, message: 'Invalid access token' });
  }
}

function authorizeAdmin(req, res, next) {
  // must be used after authenticateToken
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: no user info' });
  }

  const allowedEmail = 'anamika_jims_bca23s2@jimsindia.org';

  // Allow if role is admin OR email matches allowed email
  if (req.user.role !== 'admin' && req.user.email !== allowedEmail) {
    return res.status(403).json({ success: false, message: 'Forbidden: admins only' });
  }

  return next();
}

module.exports = { authenticateToken, authorizeAdmin };