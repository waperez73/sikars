const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ status: 'success', data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ status: 'success', data: result });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  res.status(200).json({ status: 'success', data: profile });
});
