const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../services/auth/auth.middleware');
// Import feature-level routes
const purchaseRoutes = require('../services/purchase/purchase.routes');
const particularRoutes = require('../services/particular/particular.routes');
const clientRoutes = require('../services/client/client.routes');
const invoiceRoutes = require('../services/billing/invoice/invoice.routes');
const clientOutstandingRoutes = require('../services/billing/clientOutstanding/clientOutstanding.routes');
const paymentRoutes = require('../services/billing/payment/payment.routes');
const topContentRoutes = require('../services/dashboard-report/topContent.routes');
const reportRoutes = require('../services/dashboard-report/report.routes');
const authRoutes = require('../services/auth/auth.routes');
const productRoutes = require('../services/product/product.routes');
const enhancedPurchaseRoutes = require('../services/purchase/enhancedPurchase.routes');

const enhancedInvoiceRoutes = require('../services/billing/invoice/enhancedInvoice.routes');
const enhancedReportRoutes = require('../services/dashboard-report/enhancedReport.routes');
const enhancedTopContentRoutes = require('../services/dashboard-report/enhancedTopContent.routes');

// Mount them
router.use('/particulars', authenticateToken, particularRoutes);
router.use('/purchase', authenticateToken, purchaseRoutes);
router.use('/clients', authenticateToken, clientRoutes);
router.use('/invoice', authenticateToken, invoiceRoutes);
router.use('/client-outstanding', authenticateToken, clientOutstandingRoutes);
router.use('/payment', authenticateToken, paymentRoutes);
router.use('/dashboard', authenticateToken, topContentRoutes);
router.use('/report', authenticateToken, reportRoutes);
router.use('/products', authenticateToken, productRoutes);
router.use('/purchase/enhanced', authenticateToken, enhancedPurchaseRoutes);

router.use('/invoice/enhanced', authenticateToken, enhancedInvoiceRoutes);
router.use('/reports/enhanced', authenticateToken, enhancedReportRoutes);
router.use('/dashboard/enhanced', authenticateToken, enhancedTopContentRoutes);

router.use('/auth', authRoutes);

module.exports = router;
