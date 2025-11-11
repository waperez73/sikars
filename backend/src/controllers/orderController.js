const orderService = require('../services/orderService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: order });
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id, req.pagination);
  res.status(200).json({ status: 'success', data: orders });
});
