const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const tokenHeader = req.headers.authorization;

  if (!tokenHeader) {
    req.user = null; // Guest user
    return next();
  }

  const token = tokenHeader.startsWith('Bearer ')
    ? tokenHeader.split(' ')[1]
    : tokenHeader;

  try {
    const secret = process.env.JWT_SECRET || 'excel_visual_analyzer_secret_key_2026_prod';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    // If token invalid, treat as guest or return 401 if route strictly requires auth
    req.user = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireAuth,
};
