/**
 * Auth Routes with Email Verification (Backend)
 * Updated to include email verification endpoints
 * 
 * File: backend/src/routes/authRoutes.js
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const emailVerificationController = require('../controllers/emailVerificationController');
const authMiddleware = require('../middleware/auth');

// Verify imports loaded correctly
if (typeof authMiddleware !== 'function') {
  console.error('❌ ERROR: authMiddleware is not a function in authRoutes!');
  throw new Error('Failed to load authentication middleware');
}

const requiredAuthMethods = ['register', 'login', 'verifyToken', 'logout'];
const missingAuthMethods = requiredAuthMethods.filter(method => typeof authController[method] !== 'function');

if (missingAuthMethods.length > 0) {
  console.error('❌ ERROR: authController missing methods:', missingAuthMethods);
  throw new Error('Failed to load auth controller');
}

const requiredEmailMethods = ['sendVerification', 'verifyEmail', 'checkVerificationStatus'];
const missingEmailMethods = requiredEmailMethods.filter(method => typeof emailVerificationController[method] !== 'function');

if (missingEmailMethods.length > 0) {
  console.error('❌ ERROR: emailVerificationController missing methods:', missingEmailMethods);
  throw new Error('Failed to load email verification controller');
}

console.log('✅ Auth routes (with email verification) loaded successfully');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Protected
 */
router.get('/verify', authMiddleware, authController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (logs activity)
 * @access  Protected
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Protected
 */
router.get('/me', authMiddleware, authController.verifyToken);

/**
 * @route   POST /api/auth/send-verification
 * @desc    Send email verification link
 * @access  Protected
 */
router.post('/send-verification', authMiddleware, emailVerificationController.sendVerification);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', emailVerificationController.verifyEmail);

/**
 * @route   GET /api/auth/verification-status
 * @desc    Check email verification status
 * @access  Protected
 */
router.get('/verification-status', authMiddleware, emailVerificationController.checkVerificationStatus);

module.exports = router;
