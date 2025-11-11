const paymentService = require('../services/paymentService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.processPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.processOrderPayment(req.body);
  res.status(200).json({ status: 'success', data: result });
});
