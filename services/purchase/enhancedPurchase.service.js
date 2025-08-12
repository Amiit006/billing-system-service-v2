// ===================================
// 4. ENHANCED PURCHASE SERVICE
// File: services/purchase/enhancedPurchase.service.js
const mongoose = require('mongoose');
const Purchase = require('./purchase.model');
const PurchaseProduct = require('./purchaseProduct.model');
const Product = require('../product/product.model');
const Transport = require('./transport.model');
const Season = require('./season/season.model');
const PurchasePayment = require('./payment/payment.model');
const inventoryService = require('../inventory/inventory.service');

class EnhancedPurchaseService {

  // Create purchase with product breakdown
  async createPurchaseWithProducts(seasonId, purchaseData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const now = new Date();

      // 1. Validate season
      const season = await Season.findOne({
        seasonId: parseInt(seasonId),
      }).session(session);
      
      if (!season) {
        const error = new Error('Season not found');
        error.status = 404;
        throw error;
      }

      // 2. Validate products
      if (!purchaseData.purchaseProducts || purchaseData.purchaseProducts.length === 0) {
        const error = new Error('Purchase products are required');
        error.status = 400;
        throw error;
      }

      await this.validatePurchaseProducts(purchaseData.purchaseProducts);

      // 3. Calculate overhead allocation
      const enhancedProducts = await this.calculateOverheadAllocation(
        purchaseData.purchaseProducts,
        purchaseData.taxAmount || 0,
        purchaseData.packingCharge || 0,
        purchaseData.transport?.amount || 0
      );

      // 4. Save transport (if provided)
      let transportId = null;
      if (purchaseData.transport) {
        const lastTransport = await Transport.findOne()
          .sort({ transportId: -1 })
          .lean()
          .session(session);
        const nextTransportId = lastTransport ? lastTransport.transportId + 1 : 1;

        const transport = new Transport({
          transportId: nextTransportId,
          transportName: purchaseData.transport.transportName,
          amount: purchaseData.transport.amount,
          consignmentNumber: purchaseData.transport.consignmentNumber,
          createdDate: now,
          modifiedDate: now,
        });

        const savedTransport = await transport.save({ session });
        transportId = savedTransport.transportId;
      }

      // 5. Save main purchase record
      const lastPurchase = await Purchase.findOne()
        .sort({ purchaseId: -1 })
        .lean()
        .session(session);
      const nextPurchaseId = lastPurchase ? lastPurchase.purchaseId + 1 : 1;

      const purchase = new Purchase({
        purchaseId: nextPurchaseId,
        partyName: purchaseData.partyName,
        purchaseDate: purchaseData.purchaseDate,
        purchaseAmount: purchaseData.purchaseAmount,
        packingCharge: purchaseData.packingCharge || 0,
        taxPercent: purchaseData.taxPercent,
        taxAmount: purchaseData.taxAmount,
        discountPercent: purchaseData.discountPercent,
        discountAmount: purchaseData.discountAmount,
        extraDiscountAmount: purchaseData.extraDiscountAmount || 0,
        seasonId: season.seasonId,
        transportId: transportId,
        createdDate: now,
        modifiedDate: now,
      });

      const savedPurchase = await purchase.save({ session });

      // 6. Save purchase products
      const lastPurchaseProduct = await PurchaseProduct.findOne()
        .sort({ purchaseProductId: -1 })
        .lean()
        .session(session);
      let nextPurchaseProductId = lastPurchaseProduct ? lastPurchaseProduct.purchaseProductId + 1 : 1;

      const purchaseProducts = enhancedProducts.map((product) => ({
        purchaseProductId: nextPurchaseProductId++,
        purchaseId: savedPurchase.purchaseId,
        productId: product.productId,
        productName: product.productName,
        quantity: product.quantity,
        ratePerUnit: product.ratePerUnit,
        totalAmount: product.totalAmount,
        percentageOfPurchase: product.percentageOfPurchase,
        allocatedTax: product.allocatedTax,
        allocatedTransport: product.allocatedTransport,
        allocatedPackingCharge: product.allocatedPackingCharge,
        totalAllocatedOverhead: product.totalAllocatedOverhead,
        finalCostPerUnit: product.finalCostPerUnit,
        createdDate: now,
        modifiedDate: now,
      }));

      await PurchaseProduct.insertMany(purchaseProducts, { session });

      // 7. Save payments (if any)
      if (Array.isArray(purchaseData.payments) && purchaseData.payments.length > 0) {
        const lastPayment = await PurchasePayment.findOne()
          .sort({ paymentId: -1 })
          .lean()
          .session(session);
        let nextPaymentId = lastPayment ? lastPayment.paymentId + 1 : 1;

        const payments = purchaseData.payments.map((payment) => ({
          paymentId: nextPaymentId++,
          mode: payment.mode,
          chequeNo: payment.chequeNo,
          paymentDate: payment.paymentDate,
          remark: payment.remark,
          amount: payment.amount,
          purchaseId: savedPurchase.purchaseId,
          createdDate: now,
          modifiedDate: now,
        }));

        await PurchasePayment.insertMany(payments, { session });
      }

      // 8. Update inventory for each product
      for (const product of enhancedProducts) {
        await inventoryService.updateInventoryFromPurchase(
          product.productId,
          product.quantity,
          product.finalCostPerUnit,
          savedPurchase.purchaseId,
          session
        );
      }

      await session.commitTransaction();
      session.endSession();

      return {
        purchase: savedPurchase,
        products: purchaseProducts,
        message: 'Purchase created successfully with product breakdown'
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Calculate overhead allocation using percentage method
  async calculateOverheadAllocation(purchaseProducts, taxAmount, packingCharge, transportAmount) {
    // Calculate total purchase value
    const totalPurchaseValue = purchaseProducts.reduce(
      (sum, product) => sum + product.totalAmount, 0
    );

    if (totalPurchaseValue === 0) {
      throw new Error('Total purchase value cannot be zero');
    }

    const totalOverhead = taxAmount + packingCharge + transportAmount;

    return purchaseProducts.map(product => {
      // Calculate percentage contribution
      const percentage = product.totalAmount / totalPurchaseValue;
      
      // Allocate overheads proportionally
      const allocatedTax = taxAmount * percentage;
      const allocatedPackingCharge = packingCharge * percentage;
      const allocatedTransport = transportAmount * percentage;
      const totalAllocatedOverhead = allocatedTax + allocatedPackingCharge + allocatedTransport;
      
      // Calculate final cost per unit
      const finalCostPerUnit = (product.totalAmount + totalAllocatedOverhead) / product.quantity;

      return {
        ...product,
        percentageOfPurchase: Math.round(percentage * 10000) / 100, // Round to 2 decimals
        allocatedTax: Math.round(allocatedTax * 100) / 100,
        allocatedPackingCharge: Math.round(allocatedPackingCharge * 100) / 100,
        allocatedTransport: Math.round(allocatedTransport * 100) / 100,
        totalAllocatedOverhead: Math.round(totalAllocatedOverhead * 100) / 100,
        finalCostPerUnit: Math.round(finalCostPerUnit * 100) / 100
      };
    });
  }

  // Validate purchase products
  async validatePurchaseProducts(purchaseProducts) {
    for (const product of purchaseProducts) {
      // Check required fields
      if (!product.productId || !product.quantity || !product.ratePerUnit) {
        throw new Error('Product ID, quantity, and rate per unit are required');
      }

      // Validate product exists
      const productExists = await Product.findOne({ 
        productId: product.productId, 
        isActive: true 
      });
      
      if (!productExists) {
        throw new Error(`Product with ID ${product.productId} not found`);
      }

      // Validate quantities and rates
      if (product.quantity <= 0 || product.ratePerUnit <= 0) {
        throw new Error('Quantity and rate per unit must be greater than zero');
      }

      // Validate calculated total
      const calculatedTotal = product.quantity * product.ratePerUnit;
      if (Math.abs(calculatedTotal - product.totalAmount) > 0.01) {
        throw new Error(`Total amount mismatch for product ${productExists.productName}`);
      }
    }
    return true;
  }

  // Get purchase with products
  async getPurchaseWithProducts(purchaseId) {
    const purchase = await Purchase.findOne({ purchaseId });
    if (!purchase) {
      const error = new Error('Purchase not found');
      error.status = 404;
      throw error;
    }

    const purchaseProducts = await PurchaseProduct.find({ purchaseId })
      .populate({
        path: 'productId',
        model: 'Product',
        localField: 'productId',
        foreignField: 'productId'
      });

    return {
      ...purchase.toObject(),
      purchaseProducts
    };
  }

  // Get all purchases with products for a season
  async getPurchasesWithProductsBySeason(seasonId) {
    const purchases = await Purchase.find({ seasonId: parseInt(seasonId) })
      .lean()
      .sort({ createdDate: -1 });

    const purchasesWithProducts = await Promise.all(
      purchases.map(async (purchase) => {
        const purchaseProducts = await PurchaseProduct.find({ 
          purchaseId: purchase.purchaseId 
        });
        
        return {
          ...purchase,
          purchaseProducts
        };
      })
    );

    return purchasesWithProducts;
  }
}

module.exports = new EnhancedPurchaseService();