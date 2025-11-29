/**
 * Order Routes (Backend)
 * 
 * File: backend/src/routes/orderRoutes.js
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Verify imports loaded correctly
if (typeof authMiddleware !== 'function') {
  console.error('❌ ERROR: authMiddleware is not a function in orderRoutes!');
  throw new Error('Failed to load authentication middleware');
}

const requiredMethods = ['getOrders', 'getOrder', 'createOrder', 'getOrderPDF', 'getTracking'];
const missingMethods = requiredMethods.filter(method => typeof orderController[method] !== 'function');

if (missingMethods.length > 0) {
  console.error('❌ ERROR: orderController missing methods:', missingMethods);
  throw new Error('Failed to load order controller');
}

console.log('✅ Order routes loaded successfully');

/**
 * All order routes require authentication
 */

/**
 * @route   GET /api/orders
 * @desc    Get all orders for current user
 * @access  Protected
 */
router.get('/', authMiddleware, orderController.getOrders);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Protected
 */
router.post('/', authMiddleware, orderController.createOrder);

/**
 * @route   GET /api/orders/:id
 * @desc    Get specific order details
 * @access  Protected
 */
router.get('/:id', authMiddleware, orderController.getOrder);

/**
 * @route   GET /api/orders/:id/pdf
 * @desc    Download order invoice as PDF
 * @access  Protected
 */
router.get('/:id/pdf', authMiddleware, orderController.getOrderPDF);

/**
 * @route   GET /api/orders/:id/tracking
 * @desc    Get order tracking information
 * @access  Protected
 */
router.get('/:id/tracking', authMiddleware, orderController.getTracking);

module.exports = router;
