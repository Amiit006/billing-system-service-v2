// ===================================
// ENHANCED REPORTS CONTROLLER WITH PROFIT ANALYTICS
// File: services/dashboard-report/enhancedReport.controller.js
// ===================================

const enhancedReportService = require('./enhancedReport.service');

class EnhancedReportController {

  // GET /reports/enhanced/sells/withProfit?from_date=&to_date=
  async getSellsReportWithProfit(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }
      
      const result = await enhancedReportService.getSellsReportWithProfit(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Enhanced sells report with profit data retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching enhanced sells report:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/products?from_date=&to_date=
  async getProductProfitAnalysis(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }
      
      const result = await enhancedReportService.getProductProfitAnalysis(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Product profit analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching product profit analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/top-products?limit=10
  async getTopProfitableProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const result = await enhancedReportService.getTopProfitableProducts(limit);
      
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: `Top ${limit} profitable products retrieved successfully`
      });
    } catch (error) {
      console.error('Error fetching top profitable products:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/trend?year=2024
  async getProfitTrendAnalysis(req, res) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const result = await enhancedReportService.getProfitTrendAnalysis(year);
      
      return res.status(200).json({
        success: true,
        data: result,
        year: year,
        message: `Profit trend analysis for ${year} retrieved successfully`
      });
    } catch (error) {
      console.error('Error fetching profit trend analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/clients?from_date=&to_date=
  async getClientProfitabilityAnalysis(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }
      
      const result = await enhancedReportService.getClientProfitabilityAnalysis(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Client profitability analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching client profitability analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/inventory/withProfitInsights
  async getInventoryStatusWithProfitInsights(req, res) {
    try {
      const result = await enhancedReportService.getInventoryStatusWithProfitInsights();
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Inventory status with profit insights retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching inventory status with profit insights:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/summary?from_date=&to_date=
  async getOverallProfitSummary(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }
      
      const result = await enhancedReportService.getOverallProfitSummary(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Overall profit summary retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching overall profit summary:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/low-margin?minMargin=10
  async getLowProfitMarginProducts(req, res) {
    try {
      const minMargin = parseFloat(req.query.minMargin) || 10;
      const result = await enhancedReportService.getLowProfitMarginProducts(minMargin);
      
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        minMargin: minMargin,
        message: `Products with profit margin below ${minMargin}% retrieved successfully`
      });
    } catch (error) {
      console.error('Error fetching low profit margin products:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/categories?from_date=&to_date=
  async getCategoryWiseProfitAnalysis(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }
      
      const result = await enhancedReportService.getCategoryWiseProfitAnalysis(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Category-wise profit analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching category-wise profit analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/seasonal
  async getSeasonalProfitComparison(req, res) {
    try {
      const result = await enhancedReportService.getSeasonalProfitComparison();
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Seasonal profit comparison retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching seasonal profit comparison:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/daily?from_date=&to_date=
  async getDailyProfitAnalysis(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }
      
      const result = await enhancedReportService.getDailyProfitAnalysis(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Daily profit analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching daily profit analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/optimization/pricing
  async getPriceOptimizationSuggestions(req, res) {
    try {
      const result = await enhancedReportService.getPriceOptimizationSuggestions();
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Price optimization suggestions retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching price optimization suggestions:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/profit/variance?from_date=&to_date=
  async getProfitVarianceAnalysis(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }
      
      const result = await enhancedReportService.getProfitVarianceAnalysis(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        message: 'Profit variance analysis retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching profit variance analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/dashboard/metrics?from_date=&to_date=
  async getDashboardMetrics(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }

      // Get multiple metrics in parallel
      const [
        profitSummary,
        topProducts,
        topClients,
        categoryAnalysis,
        dailyTrend
      ] = await Promise.all([
        enhancedReportService.getOverallProfitSummary(from_date, to_date),
        enhancedReportService.getTopProfitableProducts(5),
        enhancedReportService.getClientProfitabilityAnalysis(from_date, to_date),
        enhancedReportService.getCategoryWiseProfitAnalysis(from_date, to_date),
        enhancedReportService.getDailyProfitAnalysis(from_date, to_date)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          summary: profitSummary,
          topProducts: topProducts.slice(0, 5),
          topClients: topClients.slice(0, 5),
          categoryBreakdown: categoryAnalysis,
          dailyTrend: dailyTrend.slice(-30) // Last 30 days
        },
        message: 'Dashboard metrics retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/export/profit?from_date=&to_date=&format=csv
  async exportProfitReport(req, res) {
    try {
      const { from_date, to_date, format = 'json' } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }

      // Get comprehensive profit data
      const [
        sellsReport,
        productAnalysis,
        clientAnalysis,
        summary
      ] = await Promise.all([
        enhancedReportService.getSellsReportWithProfit(from_date, to_date),
        enhancedReportService.getProductProfitAnalysis(from_date, to_date),
        enhancedReportService.getClientProfitabilityAnalysis(from_date, to_date),
        enhancedReportService.getOverallProfitSummary(from_date, to_date)
      ]);

      const exportData = {
        summary,
        sellsReport,
        productAnalysis,
        clientAnalysis,
        exportedAt: new Date().toISOString(),
        period: { from_date, to_date }
      };

      if (format.toLowerCase() === 'csv') {
        // For CSV format, you would implement CSV conversion here
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=profit-report-${from_date}-to-${to_date}.csv`);
        // Implementation for CSV conversion would go here
        return res.status(200).send('CSV export not implemented yet');
      }

      // Default JSON export
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=profit-report-${from_date}-to-${to_date}.json`);
      
      return res.status(200).json({
        success: true,
        data: exportData,
        message: 'Profit report exported successfully'
      });
    } catch (error) {
      console.error('Error exporting profit report:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/alerts/profit
  async getProfitAlerts(req, res) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const today = new Date();

      const [
        lowMarginProducts,
        priceOptimizations,
        varianceAnalysis
      ] = await Promise.all([
        enhancedReportService.getLowProfitMarginProducts(15), // Below 15% margin
        enhancedReportService.getPriceOptimizationSuggestions(),
        enhancedReportService.getProfitVarianceAnalysis(
          thirtyDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        )
      ]);

      const alerts = [];

      // Critical alerts (very low margin products)
      const criticalProducts = lowMarginProducts.filter(p => p.averageProfitMargin < 5);
      if (criticalProducts.length > 0) {
        alerts.push({
          type: 'CRITICAL',
          category: 'LOW_MARGIN',
          title: `${criticalProducts.length} products with critically low margins`,
          description: 'Products selling at less than 5% profit margin',
          count: criticalProducts.length,
          data: criticalProducts.slice(0, 5),
          priority: 'HIGH'
        });
      }

      // Warning alerts (low margin products)
      const warningProducts = lowMarginProducts.filter(p => p.averageProfitMargin >= 5 && p.averageProfitMargin < 15);
      if (warningProducts.length > 0) {
        alerts.push({
          type: 'WARNING',
          category: 'LOW_MARGIN',
          title: `${warningProducts.length} products with low margins`,
          description: 'Products with profit margin between 5-15%',
          count: warningProducts.length,
          data: warningProducts.slice(0, 5),
          priority: 'MEDIUM'
        });
      }

      // Price optimization opportunities
      const optimizationOpportunities = priceOptimizations.filter(p => 
        p.optimization === 'INCREASE_PRICE' || p.optimization === 'STANDARDIZE_PRICE'
      );
      if (optimizationOpportunities.length > 0) {
        alerts.push({
          type: 'OPPORTUNITY',
          category: 'PRICE_OPTIMIZATION',
          title: `${optimizationOpportunities.length} price optimization opportunities`,
          description: 'Products that could benefit from pricing adjustments',
          count: optimizationOpportunities.length,
          data: optimizationOpportunities.slice(0, 5),
          priority: 'MEDIUM'
        });
      }

      // High variance alerts
      const highVarianceProducts = varianceAnalysis.filter(p => 
        p.profitStability === 'HIGHLY_VOLATILE' || p.profitStability === 'VOLATILE'
      );
      if (highVarianceProducts.length > 0) {
        alerts.push({
          type: 'INFO',
          category: 'PRICE_VARIANCE',
          title: `${highVarianceProducts.length} products with inconsistent pricing`,
          description: 'Products showing high profit margin variance',
          count: highVarianceProducts.length,
          data: highVarianceProducts.slice(0, 5),
          priority: 'LOW'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          alerts,
          summary: {
            totalAlerts: alerts.length,
            criticalCount: alerts.filter(a => a.priority === 'HIGH').length,
            warningCount: alerts.filter(a => a.priority === 'MEDIUM').length,
            infoCount: alerts.filter(a => a.priority === 'LOW').length
          }
        },
        message: 'Profit alerts retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching profit alerts:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/performance/kpis?from_date=&to_date=
  async getPerformanceKPIs(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }

      const [
        profitSummary,
        topProducts,
        inventoryInsights
      ] = await Promise.all([
        enhancedReportService.getOverallProfitSummary(from_date, to_date),
        enhancedReportService.getTopProfitableProducts(10),
        enhancedReportService.getInventoryStatusWithProfitInsights()
      ]);

      // Calculate KPIs
      const totalInventoryValue = inventoryInsights.reduce((sum, item) => sum + item.totalValue, 0);
      const totalPotentialProfit = inventoryInsights.reduce((sum, item) => sum + item.potentialProfit, 0);
      const avgInventoryTurnover = inventoryInsights.reduce((sum, item) => sum + item.turnoverRatio, 0) / inventoryInsights.length;

      const kpis = {
        // Profitability KPIs
        grossProfitMargin: profitSummary.overallProfitMargin,
        avgProfitPerTransaction: profitSummary.averageProfitPerSale,
        profitPerUnit: profitSummary.profitPerUnit,
        
        // Sales KPIs
        totalRevenue: profitSummary.totalRevenue,
        totalTransactions: profitSummary.totalTransactions,
        avgOrderValue: profitSummary.averageOrderValue,
        
        // Inventory KPIs
        inventoryValue: Math.round(totalInventoryValue * 100) / 100,
        potentialProfit: Math.round(totalPotentialProfit * 100) / 100,
        avgTurnoverRatio: Math.round(avgInventoryTurnover * 100) / 100,
        
        // Product Performance
        topPerformingProduct: topProducts[0] || null,
        productCount: topProducts.length,
        
        // Efficiency Metrics
        profitEfficiency: profitSummary.totalProfit / profitSummary.totalCost,
        revenuePerTransaction: profitSummary.totalRevenue / profitSummary.totalTransactions,
        
        // Growth Indicators (would need historical data for proper calculation)
        profitGrowthTrend: profitSummary.profitTrend,
        marginStability: profitSummary.maxProfitMargin - profitSummary.minProfitMargin
      };

      return res.status(200).json({
        success: true,
        data: kpis,
        period: { from_date, to_date },
        message: 'Performance KPIs retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching performance KPIs:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/enhanced/insights/ai?from_date=&to_date=
  async getAIInsights(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ 
          success: false,
          error: 'from_date and to_date are required' 
        });
      }

      const [
        profitSummary,
        productAnalysis,
        clientAnalysis,
        lowMarginProducts,
        optimizations
      ] = await Promise.all([
        enhancedReportService.getOverallProfitSummary(from_date, to_date),
        enhancedReportService.getProductProfitAnalysis(from_date, to_date),
        enhancedReportService.getClientProfitabilityAnalysis(from_date, to_date),
        enhancedReportService.getLowProfitMarginProducts(20),
        enhancedReportService.getPriceOptimizationSuggestions()
      ]);

      // Generate AI-powered insights
      const insights = [];

      // Revenue insights
      if (profitSummary.totalRevenue > 0) {
        insights.push({
          type: 'REVENUE',
          insight: `Total revenue of ₹${profitSummary.totalRevenue.toLocaleString()} with ${profitSummary.overallProfitMargin}% profit margin`,
          recommendation: profitSummary.overallProfitMargin > 25 
            ? 'Excellent profit margin! Consider expanding successful product lines.'
            : 'Consider strategies to improve profit margins through cost optimization or pricing.',
          impact: 'HIGH',
          confidence: 95
        });
      }

      // Product performance insights
      const topProduct = productAnalysis.sort((a, b) => b.totalProfit - a.totalProfit)[0];
      if (topProduct) {
        insights.push({
          type: 'PRODUCT',
          insight: `${topProduct.productName} is your most profitable product with ₹${topProduct.totalProfit} profit`,
          recommendation: `Focus marketing efforts on ${topProduct.productName} and similar high-margin products`,
          impact: 'HIGH',
          confidence: 90
        });
      }

      // Client insights
      const topClient = clientAnalysis.sort((a, b) => b.totalProfit - a.totalProfit)[0];
      if (topClient) {
        insights.push({
          type: 'CLIENT',
          insight: `${topClient.clientName} is your most profitable client contributing ₹${topClient.totalProfit} profit`,
          recommendation: 'Strengthen relationship with top clients and identify similar client profiles for targeting',
          impact: 'MEDIUM',
          confidence: 85
        });
      }

      // Optimization insights
      if (lowMarginProducts.length > 0) {
        const avgLowMargin = lowMarginProducts.reduce((sum, p) => sum + p.averageProfitMargin, 0) / lowMarginProducts.length;
        insights.push({
          type: 'OPTIMIZATION',
          insight: `${lowMarginProducts.length} products have below-average margins (avg: ${avgLowMargin.toFixed(1)}%)`,
          recommendation: 'Review pricing strategy for low-margin products or consider discontinuing unprofitable items',
          impact: 'MEDIUM',
          confidence: 80
        });
      }

      // Pricing insights
      const priceIncreaseOpportunities = optimizations.filter(o => o.optimization === 'INCREASE_PRICE');
      if (priceIncreaseOpportunities.length > 0) {
        const potentialRevenue = priceIncreaseOpportunities.reduce((sum, p) => sum + p.potentialImpact, 0);
        insights.push({
          type: 'PRICING',
          insight: `${priceIncreaseOpportunities.length} products could benefit from price increases`,
          recommendation: `Potential additional revenue of ₹${potentialRevenue.toLocaleString()} through strategic pricing`,
          impact: 'HIGH',
          confidence: 75
        });
      }

      // Inventory insights
      const slowMovingProducts = productAnalysis.filter(p => p.salesCount < 3);
      if (slowMovingProducts.length > 0) {
        insights.push({
          type: 'INVENTORY',
          insight: `${slowMovingProducts.length} products are slow-moving with minimal sales`,
          recommendation: 'Consider promotional pricing or bundling strategies for slow-moving inventory',
          impact: 'MEDIUM',
          confidence: 70
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          insights: insights.sort((a, b) => {
            const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return impactOrder[b.impact] - impactOrder[a.impact];
          }),
          summary: {
            totalInsights: insights.length,
            highImpact: insights.filter(i => i.impact === 'HIGH').length,
            avgConfidence: Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)
          }
        },
        message: 'AI insights generated successfully'
      });
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new EnhancedReportController();