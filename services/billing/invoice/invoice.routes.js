const express = require('express');
const router = express.Router();
const controller = require('./invoice.controller');

// Generate new invoice ID
router.get('/generateInvoiceId', controller.generateInvoiceId);

// Get all invoices for a client - MUST come before /:id route
router.get('/client', controller.getInvoiceByClientId);

// Create a new invoice
router.post('/createBill', controller.createBill);

// Update an existing invoice
router.put('/updateBill/:id', controller.updateBill);

// Add discount to a bill
router.put('/addDiscount/:clientId/:invoiceId', controller.addDiscountToBill);

// Get invoice by invoice ID - MUST come after specific routes
router.get('/:id', controller.getInvoiceById);

module.exports = router;