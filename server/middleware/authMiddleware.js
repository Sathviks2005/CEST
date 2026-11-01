const jwt = require('jsonwebtoken');
const User = require('../models/User');

const attachMockUser = (req, token) => {
  let mockMeta = {};
  const raw = req.headers['x-mock-user'];
  if (raw) {
    try {
      mockMeta = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      mockMeta = {};
    }
  }

  const id = mockMeta.id || mockMeta._id || token.replace(/^mock_jwt_token_/, 'user_');
  req.user = {
    _id: id,
    id,
    name: mockMeta.name || 'Self User',
    email: mockMeta.email || '',
    role: mockMeta.role || 'self_user',
    isMock: true,
  };
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Offline / client fallback tokens from AuthContext
      if (token.startsWith('mock_jwt_token_')) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(401).json({
            success: false,
            message: 'Mock authentication is disabled in production',
          });
        }
        attachMockUser(req, token);
        return next();
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: 'Server configuration error: JWT_SECRET missing',
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try fetching user if DB connected, otherwise attach payload
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        req.user = null;
      }

      if (!req.user) {
        req.user = { _id: decoded.id, id: decoded.id, role: decoded.role || 'self_user', name: decoded.name };
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token validation failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }

    // Never let a mock user be authorized as clinician on clinician routes or link routes
    if (req.user?.isMock && (roles.includes('clinician') || req.user.role === 'clinician' || (req.baseUrl && req.baseUrl.includes('clinician-links')))) {
      return res.status(403).json({
        success: false,
        message: 'Mock users are not authorized for clinician operations',
      });
    }

    next();
  };
};

// Middleware requiring a real MongoDB database-backed user
const requireRealUser = async (req, res, next) => {
  if (!req.user || req.user.isMock) {
    return res.status(401).json({
      success: false,
      message: 'A real registered user account is required for this action',
    });
  }

  const userId = req.user.id || req.user._id;
  try {
    const dbUser = await User.findById(userId).select('-password');
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: 'User account was not found in the database',
      });
    }
    req.user = dbUser;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Database authentication verification failed',
    });
  }
};

module.exports = { protect, authorize, requireRealUser };
