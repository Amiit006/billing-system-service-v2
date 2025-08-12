// ===================================
// ENHANCED REPORTS ROUTES WITH PROFIT ANALYTICS
// File: services/dashboard-report/enhancedReport.routes.js
// ===================================

const express = require('express');
const enhancedReportController = require('./enhancedReport.controller');

const router = express.Router();

// ===================================
// CORE PROFIT REPORTS
// ===================================

// Enhanced sells report with profit data
router.get('/sells/withProfit', enhancedReportController.getSellsReportWithProfit);

// Product profit analysis
router.get('/profit/products', enhancedReportController.getProductProfitAnalysis);

// Top profitable products
router.get('/profit/top-products', enhancedReportController.getTopProfitableProducts);

// Monthly profit trend analysis
router.get('/profit/trend', enhancedReportController.getProfitTrendAnalysis);

// Client profitability analysis
router.get('/profit/clients', enhancedReportController.getClientProfitabilityAnalysis);

// Overall profit summary
router.get('/profit/summary', enhancedReportController.getOverallProfitSummary);

// Low profit margin products
router.get('/profit/low-margin', enhancedReportController.getLowProfitMarginProducts);

// ===================================
// ADVANCED ANALYTICS
// ===================================

// Category-wise profit breakdown
router.get('/profit/categories', enhancedReportController.getCategoryWiseProfitAnalysis);

// Seasonal profit comparison
router.get('/profit/seasonal', enhancedReportController.getSeasonalProfitComparison);

// Daily profit analysis
router.get('/profit/daily', enhancedReportController.getDailyProfitAnalysis);

// Profit variance analysis
router.get('/profit/variance', enhancedReportController.getProfitVarianceAnalysis);

// ===================================
// INVENTORY & OPTIMIZATION
// ===================================

// Inventory status with profit insights
router.get('/inventory/withProfitInsights', enhancedReportController.getInventoryStatusWithProfitInsights);

// Price optimization suggestions
router.get('/optimization/pricing', enhancedReportController.getPriceOptimizationSuggestions);

// ===================================
// DASHBOARD & METRICS
// ===================================

// Dashboard metrics (consolidated)
router.get('/dashboard/metrics', enhancedReportController.getDashboardMetrics);

// Performance KPIs
router.get('/performance/kpis', enhancedReportController.getPerformanceKPIs);

// Profit alerts and warnings
router.get('/alerts/profit', enhancedReportController.getProfitAlerts);

// ===================================
// AI INSIGHTS & ADVANCED FEATURES
// ===================================

// AI-powered business insights
router.get('/insights/ai', enhancedReportController.getAIInsights);

// ===================================
// EXPORT & UTILITIES
// ===================================

// Export comprehensive profit report
router.get('/export/profit', enhancedReportController.exportProfitReport);

module.exports = router;