function authorizeAdmin(req, res, next) {
  // We assume authenticateToken already set req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No user info' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  next();
}

module.exports = authorizeAdmin;