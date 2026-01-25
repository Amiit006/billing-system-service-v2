// ===================================
// 5. ENHANCED PURCHASE CONTROLLER
// File: services/purchase/enhancedPurchase.controller.js
const enhancedPurchaseService = require('./enhancedPurchase.service');

class EnhancedPurchaseController {

  // POST /purchase/createWithProducts?seasonId=1
  async createPurchaseWithProducts(req, res) {
    try {
      const { seasonId } = req.query;
      
      if (!seasonId) {
        return res.status(400).json({
          success: false,
          message: 'Season ID is required'
        });
      }

      const result = await enhancedPurchaseService.createPurchaseWithProducts(seasonId, req.body);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Purchase created successfully with product breakdown'
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /purchase/withProducts/:id
  async getPurchaseWithProducts(req, res) {
    try {
      const purchaseId = parseInt(req.params.id);
      const result = await enhancedPurchaseService.getPurchaseWithProducts(purchaseId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /purchase/withProducts?seasonId=1
  async getPurchasesWithProductsBySeason(req, res) {
    try {
      const { seasonId } = req.query;
      
      if (!seasonId) {
        return res.status(400).json({
          success: false,
          message: 'Season ID is required'
        });
      }

      const result = await enhancedPurchaseService.getPurchasesWithProductsBySeason(seasonId);
      
      res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EnhancedPurchaseController();