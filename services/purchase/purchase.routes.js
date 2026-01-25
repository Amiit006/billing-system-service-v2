// services/purchase/purchase.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./purchase.controller');
const paymentRoutes = require('./payment/payment.routes');
const seasonRoutes = require('./season/season.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const enhancedPurchaseController = require('./enhancedPurchase.controller');

// Purchase APIs
router.post('/create', controller.createPurchase);
router.get('/', controller.getPurchasesBySeason);
router.get('/purchases', controller.getAllPurchases);
router.delete('/', controller.deletePurchase);

router.post('/createWithProducts', enhancedPurchaseController.createPurchaseWithProducts);
router.get('/withProducts/:id', enhancedPurchaseController.getPurchaseWithProducts);
router.get('/withProducts', enhancedPurchaseController.getPurchasesWithProductsBySeason);

// Dashboard chart

// Nested APIs
router.use('/payment', paymentRoutes);
router.use('/season', seasonRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
