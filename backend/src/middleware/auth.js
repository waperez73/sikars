const { verifyToken } = require('../config/auth');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Please log in.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const result = await query(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found. Please log in again.'
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if user is admin
    const result = await query(
      'SELECT role FROM admin_users WHERE id = $1 AND is_active = true',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    req.user.role = result.rows[0].role;
    next();
  } catch (error) {
    logger.error('Admin authorization error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authorization failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const result = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      };
    }

    next();
  } catch (error) {
    // Just continue without user
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};
