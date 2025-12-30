const jwt = require('jsonwebtoken');

// check token is valid
function isAuthenticated(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Un-Authorized' });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 🔥 QUAN TRỌNG: map userId → id
    req.user = {
      id: payload.id || payload.userId,
      role: payload.role,
      email: payload.email,
    };

    // giữ lại để tương thích code cũ
    req.payload = payload;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'TokenExpired' });
    }
    return res.status(401).json({ message: 'Un-Authorized' });
  }

  return next();
}


function authorizeRole(...allowedRole) {
  return (req, res, next) => {
    const payload = req.payload || req.user;
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized: missing user info' });
    }
    const { role } = payload;
    if (!allowedRole.includes(role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' })
    }

    next();
  };
}



module.exports = {
  isAuthenticated,
  authorizeRole
}
