// ===================================
// 3. PRODUCT ROUTES
// File: services/product/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

// Product CRUD routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getAllCategories);
router.get('/search/:term', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;