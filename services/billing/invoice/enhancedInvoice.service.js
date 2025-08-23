// 1. ENHANCED INVOICE SERVICE
// File: services/billing/invoice/enhancedInvoice.service.js
const mongoose = require('mongoose');
const InvoiceOverview = require('./invoiceOverview.model');
const InvoiceDetails = require('./invoiceDetails.model');
const Payment = require('../payment/payment.model');
const SaleProfit = require('../../profit/profit.model');

const clientService = require('../../client/client.service');
const particularService = require('../../particular/particular.service');
const productService = require('../../product/product.service');
const inventoryService = require('../../inventory/inventory.service');
const clientOutstandingService = require('../clientOutstanding/clientOutstanding.service');

const moment = require('moment');

class EnhancedInvoiceService {

  // Enhanced bill creation with profit calculation
  async createBillWithProfitTracking(invoiceDetailsDto) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { invoice, billAmountDetails, client, payment, remarks } = invoiceDetailsDto;
      const now = moment().toDate();

      // 1. Validate client
      const isClientValid = await clientService.isClientPresent(client);
      if (!isClientValid) {
        throw new Error('Client not found');
      }

      // 2. Validate bill totals
      this.validateBill(invoice, billAmountDetails);

      // 3. Map particulars to products and get costs
      const enhancedInvoiceItems = await this.mapParticularsToProductsAndCalculateProfit(
        invoice, 
        session
      );

      // 4. Generate payment ID and save payment
      const lastPayment = await Payment.findOne().sort({ paymentId: -1 }).session(session);
      const paymentId = lastPayment ? lastPayment.paymentId + 1 : 1;

      const paymentDoc = await Payment.create([{
        paymentId: paymentId,
        clientId: client.clientId,
        amount: payment.paymentAmount,
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate,
        createdDate: now,
        modifiedDate: now,
      }], { session });

      // 5. Generate invoice ID and save invoice overview
      const lastInvoice = await InvoiceOverview.findOne().sort({ invoiceId: -1 }).session(session);
      const invoiceId = lastInvoice ? lastInvoice.invoiceId + 1 : 1;

      const invoiceOverView = await InvoiceOverview.create([{
        invoiceId: invoiceId,
        clientId: client.clientId,
        paymentId: paymentDoc[0].paymentId,
        invoiceDate: payment.paymentDate,
        subTotalAmount: billAmountDetails.subTotalAmount,
        taxPercentage: billAmountDetails.taxPercentage,
        taxAmount: billAmountDetails.taxAmount,
        discountPercentage: billAmountDetails.overallDiscountPercentage,
        discountAmount: billAmountDetails.overallDiscountAmount,
        grandTotalAmount: billAmountDetails.grandTotalAmount,
        remarks,
        createdDate: now,
        modifiedDate: now,
      }], { session });

      // 6. Generate invoice details IDs and save enhanced invoice line items
      const lastInvoiceDetail = await InvoiceDetails.findOne()
        .sort({ invoiceDetailsId: -1 }).session(session);
      let invoiceDetailsId = lastInvoiceDetail ? lastInvoiceDetail.invoiceDetailsId + 1 : 1;

      const invoiceDetails = enhancedInvoiceItems.map((item) => ({
        invoiceDetailsId: invoiceDetailsId++,
        invoiceId: invoiceOverView[0].invoiceId,
        slNo: item.slNo,
        perticulars: item.perticulars,
        productId: item.productId,                    // NEW: Link to product
        amount: item.amount,
        quanity: item.quanity,
        discountPercentage: item.discount,
        total: item.total,
        discountTotal: item.discountPrice,
        quantityType: item.quantityType,
        verified: item.verified,
        costPricePerUnit: item.costPricePerUnit,      // NEW: Cost from inventory
        totalCostPrice: item.totalCostPrice,          // NEW: Total cost
        profitAmount: item.profitAmount,              // NEW: Profit amount
        profitPercentage: item.profitPercentage,      // NEW: Profit percentage
        createdDate: now,
        modifiedDate: now,
      }));

      await InvoiceDetails.insertMany(invoiceDetails, { session });

      // 7. Update inventory for each product sold
      for (const item of enhancedInvoiceItems) {
        if (item.productId && item.quanity > 0) {
          await inventoryService.updateInventoryFromSale(
            item.productId,
            item.quanity,
            invoiceOverView[0].invoiceId,
            session
          );
        }
      }

      // 8. Store profit records
      await this.storeProfitRecords(
        enhancedInvoiceItems,
        invoiceOverView[0].invoiceId,
        client.clientId,
        payment.paymentDate,
        session
      );

      // 9. Create particulars if needed (existing functionality)
      const particulars = invoice.map((x) => ({
        particularName: x.perticulars,
        discountPercentage: x.discount,
      }));
      await particularService.createMultipleParticular(particulars);

      // 10. Update client outstanding
      await clientOutstandingService.updateCustomerOutstanding(client.clientId);

      await session.commitTransaction();
      session.endSession();

      return { 
        message: 'Enhanced invoice created successfully',
        invoiceId: invoiceOverView[0].invoiceId,
        totalProfit: enhancedInvoiceItems.reduce((sum, item) => sum + item.profitAmount, 0)
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // NEW: Map particulars to products and calculate profit
  async mapParticularsToProductsAndCalculateProfit(invoiceItems, session) {
    const enhancedItems = [];

    for (const item of invoiceItems) {
      try {
        // 1. Map particular to product
        const product = await productService.mapParticularToProduct(item.perticulars);
        
        // 2. Get current inventory cost
        let costPricePerUnit = 0;
        let productId = null;
        
        if (product) {
          productId = product.productId;
          
          // Check if we have inventory for this product
          const inventoryResult = await inventoryService.updateInventoryFromSale(
            productId,
            item.quanity,
            0, // Dummy invoice ID for checking
            null, // No session for checking only
            true  // Check only, don't update
          );
          
          if (inventoryResult) {
            costPricePerUnit = inventoryResult.costPerUnit;
          }
        }

        // 3. Calculate profit
        const sellingPrice = item.total;
        const totalCostPrice = costPricePerUnit * item.quanity;
        const profitAmount = Math.round(sellingPrice - totalCostPrice);
        const profitPercentage = totalCostPrice > 0 ? 
          Math.round(((profitAmount / totalCostPrice) * 100)) : 100;
        const sellingPricePerUnit = Math.round(item.amount - item.discountPrice);
        // 4. Create enhanced item
        enhancedItems.push({
          ...item,
          productId: productId,
          costPricePerUnit: Math.round(costPricePerUnit * 100) / 100,
          totalCostPrice: Math.round(totalCostPrice * 100) / 100,
          profitAmount: Math.round(profitAmount * 100) / 100,
          profitPercentage: Math.round(profitPercentage * 100) / 100,
          sellingPricePerUnit: Math.round(sellingPricePerUnit * 100) / 100
        });

      } catch (error) {
        console.warn(`Warning: Could not process item ${item.perticulars}:`, error.message);
        
        // Add item without profit calculation
        enhancedItems.push({
          ...item,
          productId: null,
          costPricePerUnit: 0,
          totalCostPrice: 0,
          profitAmount: item.discountPrice, // Assume 100% profit if no cost
          profitPercentage: 100,
          sellingPricePerUnit: item.discountPrice / item.quanity
        });
      }
    }

    return enhancedItems;
  }

  // NEW: Store profit records for reporting
  async storeProfitRecords(enhancedItems, invoiceId, clientId, saleDate, session) {
    const lastProfit = await SaleProfit.findOne()
      .sort({ profitId: -1 }).session(session);
    let profitId = lastProfit ? lastProfit.profitId + 1 : 1;

    const profitRecords = [];

    for (const item of enhancedItems) {
      if (item.productId && item.quanity > 0) {
        profitRecords.push({
          profitId: profitId++,
          invoiceId: invoiceId,
          invoiceDetailsId: 0, // Will be updated after invoice details are saved
          productId: item.productId,
          clientId: clientId,
          quantitySold: item.quanity,
          sellingPricePerUnit: item.sellingPricePerUnit,
          costPricePerUnit: item.costPricePerUnit,
          totalRevenue: item.discountPrice,
          totalCost: item.totalCostPrice,
          grossProfit: item.profitAmount,
          profitPercentage: item.profitPercentage,
          saleDate: saleDate,
          createdDate: new Date()
        });
      }
    }

    if (profitRecords.length > 0) {
      await SaleProfit.insertMany(profitRecords, { session });
    }

    return profitRecords;
  }

  // Enhanced get invoice by ID with profit data
  async getInvoiceByIdWithProfit(invoiceId) {
    const invoice = await InvoiceOverview.findOne({ invoiceId })
      .populate({
        path: 'paymentId',
        model: 'Payment',
        localField: 'paymentId',
        foreignField: 'paymentId'
      });
    
    if (!invoice) {
      const error = new Error('Invoice not found');
      error.status = 404;
      throw error;
    }

    // Get enhanced invoice details with profit data
    const invoiceDetails = await InvoiceDetails.find({ invoiceId: invoice.invoiceId });
    
    // Get profit records
    const profitRecords = await SaleProfit.find({ invoiceId: invoice.invoiceId });

    // Calculate total profit
    const totalProfit = profitRecords.reduce((sum, record) => sum + record.grossProfit, 0);
    const totalCost = profitRecords.reduce((sum, record) => sum + record.totalCost, 0);
    const overallProfitPercentage = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 100;

    return {
      ...invoice.toObject(),
      invoiceDetails,
      profitSummary: {
        totalRevenue: invoice.grandTotalAmount,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        profitPercentage: Math.round(overallProfitPercentage * 100) / 100
      },
      profitRecords
    };
  }

  // Enhanced get invoices by client with profit data
  async getInvoiceByClientIdWithProfit(clientId) {
    const exists = await clientService.isClientPresentByClientId(clientId);
    if (!exists) {
      throw new Error('Client not found');
    }
    
    const invoices = await InvoiceOverview.find({ clientId }).sort({ createdDate: -1 });
    
    const invoicesWithProfitData = await Promise.all(
      invoices.map(async (invoice) => {
        const invoiceDetails = await InvoiceDetails.find({ invoiceId: invoice.invoiceId });
        const profitRecords = await SaleProfit.find({ invoiceId: invoice.invoiceId });
        
        const totalProfit = profitRecords.reduce((sum, record) => sum + record.grossProfit, 0);
        const totalCost = profitRecords.reduce((sum, record) => sum + record.totalCost, 0);
        
        return {
          ...invoice.toObject(),
          invoiceDetails,
          profitSummary: {
            totalRevenue: invoice.grandTotalAmount,
            totalCost: Math.round(totalCost * 100) / 100,
            totalProfit: Math.round(totalProfit * 100) / 100,
            profitPercentage: totalCost > 0 ? Math.round(((totalProfit / totalCost) * 100) * 100) / 100 : 100
        },
        };
      })
    );

    // Populate payment details
    const invoicesWithPaymentAndProfit = await Promise.all(
      invoicesWithProfitData.map(async (invoice) => {
        const payment = await Payment.findOne({ paymentId: invoice.paymentId });
        return {
          ...invoice,
          payment
        };
      })
    );

    return invoicesWithPaymentAndProfit;
  }

  // Existing validation function (unchanged)
  validateBill(invoice, billAmountDetails) {
    const subTotal = invoice.reduce((acc, item) => {
      const netAmount = item.amount * item.quanity * (1 - item.discount / 100);
      return acc + netAmount;
    }, 0);

    const discount = (subTotal * billAmountDetails.overallDiscountPercentage) / 100;
    const tax = ((subTotal - discount) * billAmountDetails.taxPercentage) / 100;
    const rawGrandTotal = subTotal - discount + tax;

    const decimalPart = rawGrandTotal % 1;
    const roundedGrandTotal = decimalPart >= 0.5
      ? Math.ceil(rawGrandTotal)
      : Math.floor(rawGrandTotal);

    const round = (val) => Math.round(val * 100) / 100;

    if (round(subTotal) !== round(billAmountDetails.subTotalAmount)) {
      throw new Error('Subtotal mismatch');
    }

    if (round(tax) !== round(billAmountDetails.taxAmount)) {
      throw new Error('Tax mismatch');
    }

    if (roundedGrandTotal !== billAmountDetails.grandTotalAmount) {
      throw new Error('Grand total mismatch');
    }

    const unverified = invoice.find((item) => item.verified === false);
    if (unverified) {
      throw new Error('One or more items not verified');
    }
  }
}

module.exports = new EnhancedInvoiceService();