const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getProducts);

// Get single product
router.get('/:slug', productController.getProduct);

router.get('/sizes', productController.getCigarSizes);

module.exports = router;
