const express = require('express');
const router = express.Router();

// Import feature-level routes
const purchaseRoutes = require('../services/purchase/purchase.routes');
const particularRoutes = require('../services/particular/particular.routes');
const clientRoutes = require('../services/client/client.routes');
const invoiceRoutes = require('../services/billing/invoice/invoice.routes');
const clientOutstandingRoutes = require('../services/billing/clientOutstanding/clientOutstanding.routes');
const paymentRoutes = require('../services/billing/payment/payment.routes');

// Mount them
router.use('/particulars', particularRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/clients', clientRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/client-outstanding', clientOutstandingRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;
