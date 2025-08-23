// ===================================
// ENHANCED TOP CONTENT ROUTES WITH PROFIT METRICS
// File: services/dashboard-report/enhancedTopContent.routes.js
// ===================================

const express = require('express');
const enhancedTopContentController = require('./enhancedTopContent.controller');

const router = express.Router();

// ===================================
// ENHANCED DASHBOARD ROUTES
// ===================================

// Enhanced top selling products with profit metrics
router.get('/topProduct', enhancedTopContentController.getTopSellingProductsWithProfit);

// Enhanced top buyers with profitability analysis
router.get('/topBuyer', enhancedTopContentController.getTopBuyersWithProfit);

// Enhanced monthly stats with profit breakdown
router.get('/monthlyStats', enhancedTopContentController.getMonthlySellStatsWithProfit);

// Enhanced dashboard summary
router.get('/summary', enhancedTopContentController.getEnhancedDashboardSummary);

// Product performance with inventory insights
router.get('/productPerformance', enhancedTopContentController.getProductPerformanceWithInventory);

// Client satisfaction metrics
router.get('/clientSatisfaction', enhancedTopContentController.getClientSatisfactionMetrics);

// Business health indicators
router.get('/businessHealth', enhancedTopContentController.getBusinessHealthIndicators);

// Comprehensive overview (combines multiple metrics)
router.get('/overview', enhancedTopContentController.getComprehensiveOverview);

// Quick stats for dashboard cards
router.get('/quickStats', enhancedTopContentController.getQuickStats);

// Dashboard widgets configuration
router.get('/widgets', enhancedTopContentController.getDashboardWidgets);

module.exports = router;