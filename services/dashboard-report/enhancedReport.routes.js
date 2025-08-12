// ===================================
// 3. ENHANCED ROUTES
// File: services/dashboard-report/enhancedReport.routes.js
const express = require('express');
const enhancedReportController = require('./enhancedReport.controller');

const router = express.Router();

// Enhanced profit reports
router.get('/sells/withProfit', enhancedReportController.getSellsReportWithProfit);
router.get('/profit/products', enhancedReportController.getProductProfitAnalysis);
router.get('/profit/top-products', enhancedReportController.getTopProfitableProducts);
router.get('/profit/trend', enhancedReportController.getProfitTrendAnalysis);
router.get('/profit/clients', enhancedReportController.getClientProfitabilityAnalysis);
router.get('/inventory/withProfitInsights', enhancedReportController.getInventoryStatusWithProfitInsights);
router.get('/profit/summary', enhancedReportController.getOverallProfitSummary);
router.get('/profit/low-margin', enhancedReportController.getLowProfitMarginProducts);

module.exports = router;