// ===================================
// 8. ENHANCED PURCHASE ROUTES
// File: services/purchase/enhancedPurchase.routes.js
const express = require('express');
const router = express.Router();
const enhancedPurchaseController = require('./enhancedPurchase.controller');

// Enhanced purchase routes
router.post('/createWithProducts', enhancedPurchaseController.createPurchaseWithProducts);
router.get('/withProducts/:id', enhancedPurchaseController.getPurchaseWithProducts);
router.get('/withProducts', enhancedPurchaseController.getPurchasesWithProductsBySeason);

module.exports = router;