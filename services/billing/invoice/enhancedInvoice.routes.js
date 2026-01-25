// ===================================
// 4. ENHANCED INVOICE ROUTES
// File: services/billing/invoice/enhancedInvoice.routes.js
const express = require('express');
const enhancedInvoiceController = require('./enhancedInvoice.controller');

const router = express.Router();

// Enhanced invoice routes
router.post('/createBillWithProfit', enhancedInvoiceController.createBillWithProfitTracking);
router.get('/:id/withProfit', enhancedInvoiceController.getInvoiceByIdWithProfit);
router.get('/client/:clientId/withProfit', enhancedInvoiceController.getInvoiceByClientIdWithProfit);

module.exports = router;