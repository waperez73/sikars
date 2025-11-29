/**
 * Authentication Routes (Backend)
 * 
 * File: backend/src/routes/authRoutes.js
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Debug: Check if middleware is loaded correctly
console.log('Auth middleware type:', typeof authMiddleware);
console.log('Auth controller methods:', Object.keys(authController));

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token validity
 * @access  Protected
 */
router.get('/verify', authMiddleware, authController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (optional - mainly client-side)
 * @access  Protected
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Protected
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;