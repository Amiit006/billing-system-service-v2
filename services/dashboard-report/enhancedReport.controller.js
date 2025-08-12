// ===================================
// 2. ENHANCED REPORTS CONTROLLER
// File: services/dashboard-report/enhancedReport.controller.js
const enhancedReportService = require('./enhancedReport.service');

class EnhancedReportController {

  // GET /reports/sells/withProfit?from_date=&to_date=
  async getSellsReportWithProfit(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ error: 'from_date and to_date are required' });
      }
      
      const result = await enhancedReportService.getSellsReportWithProfit(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('Error fetching enhanced sells report:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/profit/products?from_date=&to_date=
  async getProductProfitAnalysis(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ error: 'from_date and to_date are required' });
      }
      
      const result = await enhancedReportService.getProductProfitAnalysis(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('Error fetching product profit analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/profit/top-products?limit=10
  async getTopProfitableProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const result = await enhancedReportService.getTopProfitableProducts(limit);
      
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('Error fetching top profitable products:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/profit/trend?year=2024
  async getProfitTrendAnalysis(req, res) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const result = await enhancedReportService.getProfitTrendAnalysis(year);
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching profit trend analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/profit/clients?from_date=&to_date=
  async getClientProfitabilityAnalysis(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ error: 'from_date and to_date are required' });
      }
      
      const result = await enhancedReportService.getClientProfitabilityAnalysis(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('Error fetching client profitability analysis:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/inventory/withProfitInsights
  async getInventoryStatusWithProfitInsights(req, res) {
    try {
      const result = await enhancedReportService.getInventoryStatusWithProfitInsights();
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('Error fetching inventory status with profit insights:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/profit/summary?from_date=&to_date=
  async getOverallProfitSummary(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ error: 'from_date and to_date are required' });
      }
      
      const result = await enhancedReportService.getOverallProfitSummary(from_date, to_date);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching overall profit summary:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /reports/profit/low-margin?minMargin=10
  async getLowProfitMarginProducts(req, res) {
    try {
      const minMargin = parseFloat(req.query.minMargin) || 10;
      const result = await enhancedReportService.getLowProfitMarginProducts(minMargin);
      
      return res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('Error fetching low profit margin products:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new EnhancedReportController();