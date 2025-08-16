// ===================================
// 4. ENHANCED INVOICE CONTROLLER
// File: services/billing/invoice/enhancedInvoice.controller.js
const enhancedInvoiceService = require('./enhancedInvoice.service');

class EnhancedInvoiceController {

  // POST /invoice/enhanced/createBillWithProfit
  async createBillWithProfitTracking(req, res) {
    try {
      const result = await enhancedInvoiceService.createBillWithProfitTracking(req.body);
      res.status(201).json({ 
        success: true,
        data: result,
        message: 'Enhanced invoice with profit tracking created successfully' 
      });
    } catch (err) {
      res.status(err.status || 500).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  // GET /invoice/enhanced/:id/withProfit
  async getInvoiceByIdWithProfit(req, res) {
    try {
      const invoiceId = req.params.id;
      const result = await enhancedInvoiceService.getInvoiceByIdWithProfit(invoiceId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(err.status || 500).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  // GET /invoice/enhanced/client/:clientId/withProfit
  async getInvoiceByClientIdWithProfit(req, res) {
    try {
      const clientId = req.params.clientId;
      const result = await enhancedInvoiceService.getInvoiceByClientIdWithProfit(clientId);
      res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }
}

module.exports = new EnhancedInvoiceController();