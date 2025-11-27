/**
 * User Routes (Backend)
 * 
 * File: backend/src/routes/userRoutes.js
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Verify imports loaded correctly
if (typeof authMiddleware !== 'function') {
  console.error('❌ ERROR: authMiddleware is not a function in userRoutes!');
  console.error('Type:', typeof authMiddleware);
  throw new Error('Failed to load authentication middleware');
}

// Verify all required controller methods exist
const requiredMethods = ['getProfile', 'updateProfile', 'getAddresses', 'addAddress', 'updateAddress', 'deleteAddress'];
const missingMethods = requiredMethods.filter(method => typeof userController[method] !== 'function');

if (missingMethods.length > 0) {
  console.error('❌ ERROR: userController missing methods:', missingMethods);
  console.error('Available methods:', Object.keys(userController));
  throw new Error('Failed to load user controller - missing methods: ' + missingMethods.join(', '));
}

console.log('✅ User routes loaded successfully');

/**
 * All user routes require authentication
 */

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Protected
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Protected
 */
router.put('/profile', authMiddleware, userController.updateProfile);

/**
 * @route   GET /api/users/addresses
 * @desc    Get all addresses for current user
 * @access  Protected
 */
router.get('/addresses', authMiddleware, userController.getAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address for current user
 * @access  Protected
 */
router.post('/addresses', authMiddleware, userController.addAddress);

/**
 * @route   PUT /api/users/addresses/:id
 * @desc    Update an address
 * @access  Protected
 */
router.put('/addresses/:id', authMiddleware, userController.updateAddress);

/**
 * @route   DELETE /api/users/addresses/:id
 * @desc    Delete an address
 * @access  Protected
 */
router.delete('/addresses/:id', authMiddleware, userController.deleteAddress);

module.exports = router;