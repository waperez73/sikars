const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validate, validatePagination } = require('../middleware/validation');
const { orderSchema } = require('../utils/validators');

router.post('/', authenticate, validate(orderSchema), orderController.createOrder);
router.get('/', authenticate, validatePagination, orderController.getUserOrders);

module.exports = router;
