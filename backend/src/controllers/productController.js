const productService = require('../services/productService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  res.status(200).json({ status: 'success', data: products });
});

exports.getCigarSizes = asyncHandler(async (req, res) => {
  const sizes = await productService.getCigarSizes();
  res.status(200).json({ status: 'success', data: sizes });
});
