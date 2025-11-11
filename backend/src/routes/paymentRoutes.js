const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { paymentSchema } = require('../utils/validators');

router.post('/process', authenticate, validate(paymentSchema), paymentController.processPayment);

module.exports = router;
