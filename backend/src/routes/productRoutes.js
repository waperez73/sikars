const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/sizes', productController.getCigarSizes);

module.exports = router;
