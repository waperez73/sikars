const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth'); // Middleware that doesn't require auth

// Get cart (supports both logged-in and guest users)
router.get('/', optionalAuth, cartController.getCart);

// Add item to cart
router.post('/items', optionalAuth, cartController.addItem);

// Update item quantity
router.put('/items/:itemId', optionalAuth, cartController.updateItem);

// Remove item from cart
router.delete('/items/:itemId', optionalAuth, cartController.removeItem);

// Clear cart
router.delete('/', optionalAuth, cartController.clearCart);

module.exports = router;