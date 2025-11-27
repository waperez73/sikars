/**
 * Authentication Middleware (Backend)
 * Verifies JWT tokens for protected routes
 * 
 * File: backend/src/middleware/auth.js
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT token from Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired. Please log in again.'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }

        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }

      // Attach user info to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };

      next();
    });

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional middleware - allows both authenticated and unauthenticated access
 * Attaches user info if token is valid, but doesn't block if invalid
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.user = null;
      return next();
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      return next();
    }

    const token = parts[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        req.user = null;
      } else {
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
      }
      
      next();
    });

  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
module.exports.optional = optionalAuthMiddleware;
