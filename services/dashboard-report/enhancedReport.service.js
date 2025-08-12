// 1. ENHANCED REPORTS SERVICE
// File: services/dashboard-report/enhancedReport.service.js
const mongoose = require('mongoose');
const InvoiceOverview = require('../billing/invoice/invoiceOverview.model');
const InvoiceDetails = require('../billing/invoice/invoiceDetails.model');
const SaleProfit = require('../profit/profit.model');
const Payment = require('../billing/payment/payment.model');
const Client = require('../client/client.model');
const Product = require('../product/product.model');
const Inventory = require('../inventory/inventory.model');

const formatDate = require('../../utils/dateUtils').formatDate;

class EnhancedReportService {

  // Enhanced sells report with profit data
  async getSellsReportWithProfit(fromDate, toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Get invoices with profit data
      const invoicesWithProfit = await InvoiceOverview.aggregate([
        {
          $match: {
            invoiceDate: { $gte: from, $lte: to }
          }
        },
        {
          $lookup: {
            from: 'saleprofits',
            localField: 'invoiceId',
            foreignField: 'invoiceId',
            as: 'profitRecords'
          }
        },
        {
          $lookup: {
            from: 'client',
            localField: 'clientId',
            foreignField: 'clientId',
            as: 'clientInfo'
          }
        },
        {
          $unwind: {
            path: '$clientInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            totalProfit: { $sum: '$profitRecords.grossProfit' },
            totalCost: { $sum: '$profitRecords.totalCost' },
            profitMargin: {
              $cond: {
                if: { $gt: [{ $sum: '$profitRecords.totalCost' }, 0] },
                then: {
                  $multiply: [
                    { $divide: [{ $sum: '$profitRecords.grossProfit' }, { $sum: '$profitRecords.totalCost' }] },
                    100
                  ]
                },
                else: 100
              }
            }
          }
        },
        {
          $sort: { invoiceDate: -1 }
        }
      ]);

      return invoicesWithProfit.map(invoice => ({
        invoiceId: invoice.invoiceId,
        clientId: invoice.clientId,
        clientName: invoice.clientInfo?.clientName || 'Unknown',
        mobile: invoice.clientInfo?.mobile || '',
        invoiceDate: formatDate(invoice.invoiceDate),
        subTotalAmount: invoice.subTotalAmount,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        grandTotalAmount: invoice.grandTotalAmount,
        totalCost: Math.round((invoice.totalCost || 0) * 100) / 100,
        totalProfit: Math.round((invoice.totalProfit || 0) * 100) / 100,
        profitMargin: Math.round((invoice.profitMargin || 0) * 100) / 100
      }));
    } catch (error) {
      throw new Error(`Error fetching enhanced sells report: ${error.message}`);
    }
  }

  // Product-wise profit analysis
  async getProductProfitAnalysis(fromDate, toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const productProfitData = await SaleProfit.aggregate([
        {
          $match: {
            saleDate: { $gte: from, $lte: to }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: 'productId',
            as: 'productInfo'
          }
        },
        {
          $unwind: {
            path: '$productInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$productId',
            productName: { $first: '$productInfo.productName' },
            category: { $first: '$productInfo.category' },
            subCategory: { $first: '$productInfo.subCategory' },
            totalQuantitySold: { $sum: '$quantitySold' },
            totalRevenue: { $sum: '$totalRevenue' },
            totalCost: { $sum: '$totalCost' },
            totalProfit: { $sum: '$grossProfit' },
            salesCount: { $sum: 1 }
          }
        },
        {
          $addFields: {
            profitMargin: {
              $cond: {
                if: { $gt: ['$totalCost', 0] },
                then: { $multiply: [{ $divide: ['$totalProfit', '$totalCost'] }, 100] },
                else: 100
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      const result = [];
      for (let month = 1; month <= 12; month++) {
        const monthData = monthlyProfitData.find(item => item._id === month);
        result.push({
          month: monthNames[month - 1],
          totalRevenue: monthData ? Math.round(monthData.totalRevenue * 100) / 100 : 0,
          totalCost: monthData ? Math.round(monthData.totalCost * 100) / 100 : 0,
          totalProfit: monthData ? Math.round(monthData.totalProfit * 100) / 100 : 0,
          profitMargin: monthData ? Math.round(monthData.profitMargin * 100) / 100 : 0,
          salesCount: monthData ? monthData.salesCount : 0
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Error fetching profit trend analysis: ${error.message}`);
    }
  }

  // Client profitability analysis
  async getClientProfitabilityAnalysis(fromDate, toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const clientProfitData = await SaleProfit.aggregate([
        {
          $match: {
            saleDate: { $gte: from, $lte: to }
          }
        },
        {
          $lookup: {
            from: 'client',
            localField: 'clientId',
            foreignField: 'clientId',
            as: 'clientInfo'
          }
        },
        {
          $unwind: {
            path: '$clientInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$clientId',
            clientName: { $first: '$clientInfo.clientName' },
            mobile: { $first: '$clientInfo.mobile' },
            totalRevenue: { $sum: '$totalRevenue' },
            totalCost: { $sum: '$totalCost' },
            totalProfit: { $sum: '$grossProfit' },
            salesCount: { $sum: 1 },
            totalQuantitySold: { $sum: '$quantitySold' }
          }
        },
        {
          $addFields: {
            profitMargin: {
              $cond: {
                if: { $gt: ['$totalCost', 0] },
                then: { $multiply: [{ $divide: ['$totalProfit', '$totalCost'] }, 100] },
                else: 100
              }
            }
          }
        },
        {
          $sort: { totalProfit: -1 }
        }
      ]);

      return clientProfitData.map(client => ({
        clientId: client._id,
        clientName: client.clientName || 'Unknown',
        mobile: client.mobile || '',
        totalRevenue: Math.round(client.totalRevenue * 100) / 100,
        totalCost: Math.round(client.totalCost * 100) / 100,
        totalProfit: Math.round(client.totalProfit * 100) / 100,
        profitMargin: Math.round(client.profitMargin * 100) / 100,
        salesCount: client.salesCount,
        totalQuantitySold: client.totalQuantitySold
      }));
    } catch (error) {
      throw new Error(`Error fetching client profitability analysis: ${error.message}`);
    }
  }

  // Current inventory status with profit insights
  async getInventoryStatusWithProfitInsights() {
    try {
      const inventoryWithProfit = await Inventory.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: 'productId',
            as: 'productInfo'
          }
        },
        {
          $unwind: {
            path: '$productInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'saleprofits',
            localField: 'productId',
            foreignField: 'productId',
            as: 'salesHistory'
          }
        },
        {
          $addFields: {
            averageSellingPrice: { $avg: '$salesHistory.sellingPricePerUnit' },
            totalQuantitySold: { $sum: '$salesHistory.quantitySold' },
            averageProfitMargin: { $avg: '$salesHistory.profitPercentage' },
            potentialProfit: {
              $cond: {
                if: { $gt: ['$availableQuantity', 0] },
                then: {
                  $multiply: [
                    '$availableQuantity',
                    { $subtract: [{ $avg: '$salesHistory.sellingPricePerUnit' }, '$weightedAverageCost'] }
                  ]
                },
                else: 0
              }
            }
          }
        },
        {
          $sort: { availableQuantity: -1 }
        }
      ]);

      return inventoryWithProfit.map(item => ({
        productId: item.productId,
        productName: item.productInfo?.productName || 'Unknown Product',
        category: item.productInfo?.category || 'Unknown',
        availableQuantity: item.availableQuantity,
        weightedAverageCost: Math.round(item.weightedAverageCost * 100) / 100,
        totalValue: Math.round(item.totalValue * 100) / 100,
        averageSellingPrice: Math.round((item.averageSellingPrice || 0) * 100) / 100,
        totalQuantitySold: item.totalQuantitySold || 0,
        averageProfitMargin: Math.round((item.averageProfitMargin || 0) * 100) / 100,
        potentialProfit: Math.round((item.potentialProfit || 0) * 100) / 100,
        lastUpdated: formatDate(item.lastUpdatedDate)
      }));
    } catch (error) {
      throw new Error(`Error fetching inventory status with profit insights: ${error.message}`);
    }
  }

  // Overall profit summary
  async getOverallProfitSummary(fromDate, toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const profitSummary = await SaleProfit.aggregate([
        {
          $match: {
            saleDate: { $gte: from, $lte: to }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalRevenue' },
            totalCost: { $sum: '$totalCost' },
            totalProfit: { $sum: '$grossProfit' },
            totalTransactions: { $sum: 1 },
            totalQuantitySold: { $sum: '$quantitySold' },
            averageProfitPerSale: { $avg: '$grossProfit' },
            averageProfitMargin: { $avg: '$profitPercentage' }
          }
        },
        {
          $addFields: {
            overallProfitMargin: {
              $cond: {
                if: { $gt: ['$totalCost', 0] },
                then: { $multiply: [{ $divide: ['$totalProfit', '$totalCost'] }, 100] },
                else: 100
              }
            }
          }
        }
      ]);

      const summary = profitSummary[0] || {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalTransactions: 0,
        totalQuantitySold: 0,
        averageProfitPerSale: 0,
        averageProfitMargin: 0,
        overallProfitMargin: 0
      };

      return {
        totalRevenue: Math.round(summary.totalRevenue * 100) / 100,
        totalCost: Math.round(summary.totalCost * 100) / 100,
        totalProfit: Math.round(summary.totalProfit * 100) / 100,
        overallProfitMargin: Math.round(summary.overallProfitMargin * 100) / 100,
        totalTransactions: summary.totalTransactions,
        totalQuantitySold: summary.totalQuantitySold,
        averageProfitPerSale: Math.round(summary.averageProfitPerSale * 100) / 100,
        averageProfitMargin: Math.round(summary.averageProfitMargin * 100) / 100
      };
    } catch (error) {
      throw new Error(`Error fetching overall profit summary: ${error.message}`);
    }
  }

  // Low profit margin products (potential optimization)
  async getLowProfitMarginProducts(minMargin = 10) {
    try {
      const lowMarginProducts = await SaleProfit.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: 'productId',
            as: 'productInfo'
          }
        },
        {
          $unwind: {
            path: '$productInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$productId',
            productName: { $first: '$productInfo.productName' },
            category: { $first: '$productInfo.category' },
            averageProfitMargin: { $avg: '$profitPercentage' },
            totalRevenue: { $sum: '$totalRevenue' },
            totalProfit: { $sum: '$grossProfit' },
            salesCount: { $sum: 1 }
          }
        },
        {
          $match: {
            averageProfitMargin: { $lt: minMargin }
          }
        },
        {
          $sort: { averageProfitMargin: 1 }
        }
      ]);

      return lowMarginProducts.map(product => ({
        productId: product._id,
        productName: product.productName || 'Unknown Product',
        category: product.category || 'Unknown',
        averageProfitMargin: Math.round(product.averageProfitMargin * 100) / 100,
        totalRevenue: Math.round(product.totalRevenue * 100) / 100,
        totalProfit: Math.round(product.totalProfit * 100) / 100,
        salesCount: product.salesCount,
        recommendation: product.averageProfitMargin < 5 ? 
          'Consider discontinuing or repricing' : 
          'Review pricing strategy'
      }));
    } catch (error) {
      throw new Error(`Error fetching low profit margin products: ${error.message}`);
    }
  }
}

module.exports = new EnhancedReportService();