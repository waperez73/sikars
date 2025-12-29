const productService = require('../services/productService');
const { asyncHandler } = require('../middleware/errorHandler');

const db = require('../config/database');

exports.getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  res.status(200).json({ status: 'success', data: products });
});

exports.getCigarSizes = asyncHandler(async (req, res) => {
  const sizes = await productService.getCigarSizes();
  res.status(200).json({ status: 'success', data: sizes });
});


// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { featured, category, inStock } = req.query;
    
    let query = 'SELECT * FROM available_products WHERE is_active = true';
    const params = [];
    let paramCount = 1;

    if (featured === 'true') {
      query += ` AND featured = $${paramCount}`;
      params.push(true);
      paramCount++;
    }

    if (inStock === 'true') {
      query += ` AND in_stock = $${paramCount}`;
      params.push(true);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const products = await db.query(query, params);
    res.json(products.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to load products' });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await db.query(
      'SELECT * FROM available_products WHERE slug = $1 AND is_active = true',
      [slug]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to load product' });
  }
};

module.exports = exports;