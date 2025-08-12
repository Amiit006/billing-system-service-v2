// ===================================
// ENHANCED REPORTS SERVICE WITH PROFIT ANALYTICS
// File: services/dashboard-report/enhancedReport.service.js
// ===================================

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
            salesCount: { $sum: 1 },
            avgSellingPrice: { $avg: '$sellingPricePerUnit' },
            avgCostPrice: { $avg: '$costPricePerUnit' }
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
            },
            avgProfitPerUnit: {
              $cond: {
                if: { $gt: ['$totalQuantitySold', 0] },
                then: { $divide: ['$totalProfit', '$totalQuantitySold'] },
                else: 0
              }
            }
          }
        },
        {
          $sort: { totalProfit: -1 }
        }
      ]);

      return productProfitData.map(product => ({
        productId: product._id,
        productName: product.productName || 'Unknown Product',
        category: product.category || 'Unknown',
        subCategory: product.subCategory || 'Unknown',
        totalQuantitySold: product.totalQuantitySold,
        totalRevenue: Math.round(product.totalRevenue * 100) / 100,
        totalCost: Math.round(product.totalCost * 100) / 100,
        totalProfit: Math.round(product.totalProfit * 100) / 100,
        profitMargin: Math.round(product.profitMargin * 100) / 100,
        salesCount: product.salesCount,
        avgSellingPrice: Math.round(product.avgSellingPrice * 100) / 100,
        avgCostPrice: Math.round(product.avgCostPrice * 100) / 100,
        avgProfitPerUnit: Math.round(product.avgProfitPerUnit * 100) / 100
      }));
    } catch (error) {
      throw new Error(`Error fetching product profit analysis: ${error.message}`);
    }
  }

  // Top profitable products
  async getTopProfitableProducts(limit = 10) {
    try {
      const topProducts = await SaleProfit.aggregate([
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
            totalProfit: { $sum: '$grossProfit' },
            totalRevenue: { $sum: '$totalRevenue' },
            totalQuantitySold: { $sum: '$quantitySold' },
            avgProfitMargin: { $avg: '$profitPercentage' },
            salesCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalProfit: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return topProducts.map(product => ({
        productId: product._id,
        productName: product.productName || 'Unknown Product',
        category: product.category || 'Unknown',
        totalProfit: Math.round(product.totalProfit * 100) / 100,
        totalRevenue: Math.round(product.totalRevenue * 100) / 100,
        totalQuantitySold: product.totalQuantitySold,
        avgProfitMargin: Math.round(product.avgProfitMargin * 100) / 100,
        salesCount: product.salesCount
      }));
    } catch (error) {
      throw new Error(`Error fetching top profitable products: ${error.message}`);
    }
  }

  // Monthly profit trend analysis
  async getProfitTrendAnalysis(year) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const monthlyProfitData = await SaleProfit.aggregate([
        {
          $match: {
            saleDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $month: '$saleDate' },
            totalRevenue: { $sum: '$totalRevenue' },
            totalCost: { $sum: '$totalCost' },
            totalProfit: { $sum: '$grossProfit' },
            salesCount: { $sum: 1 },
            avgProfitMargin: { $avg: '$profitPercentage' }
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
            totalQuantitySold: { $sum: '$quantitySold' },
            avgProfitMargin: { $avg: '$profitPercentage' }
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
            },
            avgOrderValue: {
              $cond: {
                if: { $gt: ['$salesCount', 0] },
                then: { $divide: ['$totalRevenue', '$salesCount'] },
                else: 0
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
        totalQuantitySold: client.totalQuantitySold,
        avgOrderValue: Math.round(client.avgOrderValue * 100) / 100,
        avgProfitMargin: Math.round(client.avgProfitMargin * 100) / 100
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
            averageSellingPrice: { 
              $cond: {
                if: { $gt: [{ $size: '$salesHistory' }, 0] },
                then: { $avg: '$salesHistory.sellingPricePerUnit' },
                else: 0
              }
            },
            totalQuantitySold: { $sum: '$salesHistory.quantitySold' },
            averageProfitMargin: { 
              $cond: {
                if: { $gt: [{ $size: '$salesHistory' }, 0] },
                then: { $avg: '$salesHistory.profitPercentage' },
                else: 0
              }
            },
            lastSaleDate: { $max: '$salesHistory.saleDate' },
            totalSalesValue: { $sum: '$salesHistory.totalRevenue' },
            totalProfitEarned: { $sum: '$salesHistory.grossProfit' }
          }
        },
        {
          $addFields: {
            potentialSellingValue: {
              $cond: {
                if: { $and: [{ $gt: ['$availableQuantity', 0] }, { $gt: ['$averageSellingPrice', 0] }] },
                then: { $multiply: ['$availableQuantity', '$averageSellingPrice'] },
                else: 0
              }
            },
            potentialProfit: {
              $cond: {
                if: { $gt: ['$availableQuantity', 0] },
                then: {
                  $multiply: [
                    '$availableQuantity',
                    { $subtract: ['$averageSellingPrice', '$weightedAverageCost'] }
                  ]
                },
                else: 0
              }
            },
            turnoverRatio: {
              $cond: {
                if: { $gt: ['$totalValue', 0] },
                then: { $divide: ['$totalSalesValue', '$totalValue'] },
                else: 0
              }
            },
            daysSinceLastSale: {
              $cond: {
                if: { $ne: ['$lastSaleDate', null] },
                then: {
                  $divide: [
                    { $subtract: [new Date(), '$lastSaleDate'] },
                    86400000 // milliseconds in a day
                  ]
                },
                else: null
              }
            }
          }
        },
        {
          $sort: { totalValue: -1 }
        }
      ]);

      return inventoryWithProfit.map(item => ({
        productId: item.productId,
        productName: item.productInfo?.productName || 'Unknown Product',
        category: item.productInfo?.category || 'Unknown',
        subCategory: item.productInfo?.subCategory || 'Unknown',
        availableQuantity: item.availableQuantity,
        weightedAverageCost: Math.round(item.weightedAverageCost * 100) / 100,
        totalValue: Math.round(item.totalValue * 100) / 100,
        averageSellingPrice: Math.round((item.averageSellingPrice || 0) * 100) / 100,
        potentialSellingValue: Math.round((item.potentialSellingValue || 0) * 100) / 100,
        potentialProfit: Math.round((item.potentialProfit || 0) * 100) / 100,
        totalQuantitySold: item.totalQuantitySold || 0,
        averageProfitMargin: Math.round((item.averageProfitMargin || 0) * 100) / 100,
        totalSalesValue: Math.round((item.totalSalesValue || 0) * 100) / 100,
        totalProfitEarned: Math.round((item.totalProfitEarned || 0) * 100) / 100,
        turnoverRatio: Math.round((item.turnoverRatio || 0) * 100) / 100,
        daysSinceLastSale: item.daysSinceLastSale ? Math.floor(item.daysSinceLastSale) : null,
        lastSaleDate: item.lastSaleDate ? formatDate(item.lastSaleDate) : 'Never',
        lastUpdated: formatDate(item.lastUpdatedDate),
        stockStatus: this.getStockStatus(item.availableQuantity, item.daysSinceLastSale),
        profitabilityRating: this.getProfitabilityRating(item.averageProfitMargin)
      }));
    } catch (error) {
      throw new Error(`Error fetching inventory status with profit insights: ${error.message}`);
    }
  }

  // Helper method for stock status
  getStockStatus(quantity, daysSinceLastSale) {
    if (quantity === 0) return 'OUT_OF_STOCK';
    if (quantity < 10) return 'LOW_STOCK';
    if (daysSinceLastSale && daysSinceLastSale > 90) return 'SLOW_MOVING';
    if (daysSinceLastSale && daysSinceLastSale > 180) return 'DEAD_STOCK';
    return 'HEALTHY';
  }

  // Helper method for profitability rating
  getProfitabilityRating(profitMargin) {
    if (profitMargin >= 50) return 'EXCELLENT';
    if (profitMargin >= 30) return 'GOOD';
    if (profitMargin >= 15) return 'AVERAGE';
    if (profitMargin >= 5) return 'LOW';
    return 'VERY_LOW';
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
            averageProfitMargin: { $avg: '$profitPercentage' },
            minProfitMargin: { $min: '$profitPercentage' },
            maxProfitMargin: { $max: '$profitPercentage' },
            averageOrderValue: { $avg: '$totalRevenue' }
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
            },
            profitPerUnit: {
              $cond: {
                if: { $gt: ['$totalQuantitySold', 0] },
                then: { $divide: ['$totalProfit', '$totalQuantitySold'] },
                else: 0
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
        overallProfitMargin: 0,
        minProfitMargin: 0,
        maxProfitMargin: 0,
        averageOrderValue: 0,
        profitPerUnit: 0
      };

      // Get additional metrics
      const [topProduct, topClient] = await Promise.all([
        this.getTopProfitableProducts(1),
        this.getClientProfitabilityAnalysis(fromDate, toDate)
      ]);

      return {
        totalRevenue: Math.round(summary.totalRevenue * 100) / 100,
        totalCost: Math.round(summary.totalCost * 100) / 100,
        totalProfit: Math.round(summary.totalProfit * 100) / 100,
        overallProfitMargin: Math.round(summary.overallProfitMargin * 100) / 100,
        totalTransactions: summary.totalTransactions,
        totalQuantitySold: summary.totalQuantitySold,
        averageProfitPerSale: Math.round(summary.averageProfitPerSale * 100) / 100,
        averageProfitMargin: Math.round(summary.averageProfitMargin * 100) / 100,
        averageOrderValue: Math.round(summary.averageOrderValue * 100) / 100,
        profitPerUnit: Math.round(summary.profitPerUnit * 100) / 100,
        minProfitMargin: Math.round(summary.minProfitMargin * 100) / 100,
        maxProfitMargin: Math.round(summary.maxProfitMargin * 100) / 100,
        topProfitableProduct: topProduct[0] || null,
        topClient: topClient[0] || null,
        profitTrend: summary.totalProfit > 0 ? 'POSITIVE' : 'NEGATIVE'
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
            totalCost: { $sum: '$totalCost' },
            totalProfit: { $sum: '$grossProfit' },
            salesCount: { $sum: 1 },
            totalQuantitySold: { $sum: '$quantitySold' },
            avgCostPrice: { $avg: '$costPricePerUnit' },
            avgSellingPrice: { $avg: '$sellingPricePerUnit' },
            lastSaleDate: { $max: '$saleDate' }
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
        totalCost: Math.round(product.totalCost * 100) / 100,
        totalProfit: Math.round(product.totalProfit * 100) / 100,
        salesCount: product.salesCount,
        totalQuantitySold: product.totalQuantitySold,
        avgCostPrice: Math.round(product.avgCostPrice * 100) / 100,
        avgSellingPrice: Math.round(product.avgSellingPrice * 100) / 100,
        lastSaleDate: formatDate(product.lastSaleDate),
        recommendation: this.getRecommendation(product.averageProfitMargin, product.salesCount),
        suggestedSellingPrice: Math.round((product.avgCostPrice * 1.3) * 100) / 100 // 30% margin suggestion
      }));
    } catch (error) {
      throw new Error(`Error fetching low profit margin products: ${error.message}`);
    }
  }

  // Helper method for recommendations
  getRecommendation(profitMargin, salesCount) {
    if (profitMargin < 0) return 'CRITICAL: Selling at loss - Review pricing immediately';
    if (profitMargin < 5) return 'URGENT: Very low margin - Consider repricing or discontinuing';
    if (profitMargin < 10 && salesCount > 10) return 'MODERATE: Low margin but good volume - Optimize costs';
    if (profitMargin < 10 && salesCount <= 10) return 'REVIEW: Low margin and volume - Consider discontinuing';
    return 'MONITOR: Below target margin - Review pricing strategy';
  }

  // Category-wise profit analysis
  async getCategoryWiseProfitAnalysis(fromDate, toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const categoryProfitData = await SaleProfit.aggregate([
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
            _id: {
              category: '$productInfo.category',
              subCategory: '$productInfo.subCategory'
            },
            totalRevenue: { $sum: '$totalRevenue' },
            totalCost: { $sum: '$totalCost' },
            totalProfit: { $sum: '$grossProfit' },
            totalQuantitySold: { $sum: '$quantitySold' },
            salesCount: { $sum: 1 },
            avgProfitMargin: { $avg: '$profitPercentage' }
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
          $sort: { '_id.category': 1, '_id.subCategory': 1 }
        }
      ]);

      return categoryProfitData.map(category => ({
        category: category._id.category || 'Unknown',
        subCategory: category._id.subCategory || 'Unknown',
        totalRevenue: Math.round(category.totalRevenue * 100) / 100,
        totalCost: Math.round(category.totalCost * 100) / 100,
        totalProfit: Math.round(category.totalProfit * 100) / 100,
        profitMargin: Math.round(category.profitMargin * 100) / 100,
        totalQuantitySold: category.totalQuantitySold,
        salesCount: category.salesCount,
        avgProfitMargin: Math.round(category.avgProfitMargin * 100) / 100
      }));
    } catch (error) {
      throw new Error(`Error fetching category-wise profit analysis: ${error.message}`);
    }
  }

  // Seasonal profit comparison
  async getSeasonalProfitComparison() {
    try {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      const seasonalData = await SaleProfit.aggregate([
        {
          $match: {
            saleDate: {
              $gte: new Date(lastYear, 0, 1),
              $lte: new Date(currentYear, 11, 31)
            }
          }
        },
        {
          $addFields: {
            year: { $year: '$saleDate' },
            quarter: {
              $switch: {
                branches: [
                  { case: { $lte: [{ $month: '$saleDate' }, 3] }, then: 'Q1' },
                  { case: { $lte: [{ $month: '$saleDate' }, 6] }, then: 'Q2' },
                  { case: { $lte: [{ $month: '$saleDate' }, 9] }, then: 'Q3' },
                  { case: { $lte: [{ $month: '$saleDate' }, 12] }, then: 'Q4' }
                ],
                default: 'Q1'
              }
            }
          }
        },
        {
          $group: {
            _id: {
              year: '$year',
              quarter: '$quarter'
            },
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
          $sort: { '_id.year': 1, '_id.quarter': 1 }
        }
      ]);

      return seasonalData.map(season => ({
        year: season._id.year,
        quarter: season._id.quarter,
        totalRevenue: Math.round(season.totalRevenue * 100) / 100,
        totalCost: Math.round(season.totalCost * 100) / 100,
        totalProfit: Math.round(season.totalProfit * 100) / 100,
        profitMargin: Math.round(season.profitMargin * 100) / 100,
        salesCount: season.salesCount
      }));
    } catch (error) {
      throw new Error(`Error fetching seasonal profit comparison: ${error.message}`);
    }
  }

  // Daily profit analysis for trend identification
  async getDailyProfitAnalysis(fromDate, toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const dailyProfitData = await SaleProfit.aggregate([
        {
          $match: {
            saleDate: { $gte: from, $lte: to }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { 
                format: '%Y-%m-%d', 
                date: '$saleDate' 
              }
            },
            totalRevenue: { $sum: '$totalRevenue' },
            totalCost: { $sum: '$totalCost' },
            totalProfit: { $sum: '$grossProfit' },
            salesCount: { $sum: 1 },
            avgProfitMargin: { $avg: '$profitPercentage' }
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
            },
            date: { $dateFromString: { dateString: '$_id' } }
          }
        },
        {
          $sort: { date: 1 }
        }
      ]);

      return dailyProfitData.map(day => ({
        date: day._id,
        totalRevenue: Math.round(day.totalRevenue * 100) / 100,
        totalCost: Math.round(day.totalCost * 100) / 100,
        totalProfit: Math.round(day.totalProfit * 100) / 100,
        profitMargin: Math.round(day.profitMargin * 100) / 100,
        salesCount: day.salesCount,
        avgProfitMargin: Math.round(day.avgProfitMargin * 100) / 100
      }));
    } catch (error) {
      throw new Error(`Error fetching daily profit analysis: ${error.message}`);
    }
  }

  // Price optimization suggestions
  async getPriceOptimizationSuggestions() {
    try {
      const optimizationData = await SaleProfit.aggregate([
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
            from: 'inventory',
            localField: 'productId',
            foreignField: 'productId',
            as: 'inventoryInfo'
          }
        },
        {
          $unwind: {
            path: '$inventoryInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$productId',
            productName: { $first: '$productInfo.productName' },
            category: { $first: '$productInfo.category' },
            currentCost: { $first: '$inventoryInfo.weightedAverageCost' },
            availableQuantity: { $first: '$inventoryInfo.availableQuantity' },
            avgSellingPrice: { $avg: '$sellingPricePerUnit' },
            avgProfitMargin: { $avg: '$profitPercentage' },
            totalQuantitySold: { $sum: '$quantitySold' },
            salesCount: { $sum: 1 },
            lastSaleDate: { $max: '$saleDate' },
            minSellingPrice: { $min: '$sellingPricePerUnit' },
            maxSellingPrice: { $max: '$sellingPricePerUnit' }
          }
        },
        {
          $addFields: {
            priceVariability: {
              $cond: {
                if: { $gt: ['$minSellingPrice', 0] },
                then: {
                  $multiply: [
                    { $divide: [
                      { $subtract: ['$maxSellingPrice', '$minSellingPrice'] },
                      '$avgSellingPrice'
                    ]},
                    100
                  ]
                },
                else: 0
              }
            },
            daysSinceLastSale: {
              $divide: [
                { $subtract: [new Date(), '$lastSaleDate'] },
                86400000
              ]
            }
          }
        },
        {
          $addFields: {
            suggestedPrice: {
              $cond: {
                if: { $lt: ['$avgProfitMargin', 20] },
                then: { $multiply: ['$currentCost', 1.25] }, // 25% margin
                else: '$avgSellingPrice'
              }
            },
            optimization: {
              $switch: {
                branches: [
                  {
                    case: { $lt: ['$avgProfitMargin', 5] },
                    then: 'INCREASE_PRICE'
                  },
                  {
                    case: { $and: [
                      { $gt: ['$avgProfitMargin', 40] },
                      { $lt: ['$totalQuantitySold', 5] }
                    ]},
                    then: 'DECREASE_PRICE'
                  },
                  {
                    case: { $gt: ['$priceVariability', 20] },
                    then: 'STANDARDIZE_PRICE'
                  }
                ],
                default: 'MAINTAIN_PRICE'
              }
            }
          }
        },
        {
          $match: {
            $or: [
              { avgProfitMargin: { $lt: 20 } },
              { priceVariability: { $gt: 15 } },
              { daysSinceLastSale: { $gt: 60 } }
            ]
          }
        },
        {
          $sort: { avgProfitMargin: 1 }
        }
      ]);

      return optimizationData.map(product => ({
        productId: product._id,
        productName: product.productName || 'Unknown Product',
        category: product.category || 'Unknown',
        currentCost: Math.round((product.currentCost || 0) * 100) / 100,
        avgSellingPrice: Math.round(product.avgSellingPrice * 100) / 100,
        suggestedPrice: Math.round(product.suggestedPrice * 100) / 100,
        avgProfitMargin: Math.round(product.avgProfitMargin * 100) / 100,
        priceVariability: Math.round(product.priceVariability * 100) / 100,
        optimization: product.optimization,
        availableQuantity: product.availableQuantity || 0,
        totalQuantitySold: product.totalQuantitySold,
        daysSinceLastSale: Math.floor(product.daysSinceLastSale),
        potentialImpact: this.calculatePotentialImpact(
          product.avgSellingPrice, 
          product.suggestedPrice, 
          product.totalQuantitySold
        )
      }));
    } catch (error) {
      throw new Error(`Error fetching price optimization suggestions: ${error.message}`);
    }
  }

  // Helper method to calculate potential impact
  calculatePotentialImpact(currentPrice, suggestedPrice, salesVolume) {
    const priceDiff = suggestedPrice - currentPrice;
    const potentialRevenueDiff = priceDiff * salesVolume;
    return Math.round(potentialRevenueDiff * 100) / 100;
  }

  // Profit variance analysis
  async getProfitVarianceAnalysis(fromDate, toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const varianceData = await SaleProfit.aggregate([
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
            profitMargins: { $push: '$profitPercentage' },
            avgProfitMargin: { $avg: '$profitPercentage' },
            minProfitMargin: { $min: '$profitPercentage' },
            maxProfitMargin: { $max: '$profitPercentage' },
            salesCount: { $sum: 1 }
          }
        },
        {
          $addFields: {
            profitVariance: {
              $subtract: ['$maxProfitMargin', '$minProfitMargin']
            },
            profitStability: {
              $switch: {
                branches: [
                  { 
                    case: { $lte: [{ $subtract: ['$maxProfitMargin', '$minProfitMargin'] }, 5] },
                    then: 'VERY_STABLE'
                  },
                  { 
                    case: { $lte: [{ $subtract: ['$maxProfitMargin', '$minProfitMargin'] }, 15] },
                    then: 'STABLE'
                  },
                  { 
                    case: { $lte: [{ $subtract: ['$maxProfitMargin', '$minProfitMargin'] }, 30] },
                    then: 'MODERATE'
                  },
                  { 
                    case: { $lte: [{ $subtract: ['$maxProfitMargin', '$minProfitMargin'] }, 50] },
                    then: 'VOLATILE'
                  }
                ],
                default: 'HIGHLY_VOLATILE'
              }
            }
          }
        },
        {
          $match: {
            salesCount: { $gte: 3 } // Only products with multiple sales
          }
        },
        {
          $sort: { profitVariance: -1 }
        }
      ]);

      return varianceData.map(product => ({
        productId: product._id,
        productName: product.productName || 'Unknown Product',
        avgProfitMargin: Math.round(product.avgProfitMargin * 100) / 100,
        minProfitMargin: Math.round(product.minProfitMargin * 100) / 100,
        maxProfitMargin: Math.round(product.maxProfitMargin * 100) / 100,
        profitVariance: Math.round(product.profitVariance * 100) / 100,
        profitStability: product.profitStability,
        salesCount: product.salesCount,
        recommendation: this.getVarianceRecommendation(product.profitVariance, product.profitStability)
      }));
    } catch (error) {
      throw new Error(`Error fetching profit variance analysis: ${error.message}`);
    }
  }

  // Helper method for variance recommendations
  getVarianceRecommendation(variance, stability) {
    if (stability === 'HIGHLY_VOLATILE') {
      return 'Review pricing strategy - high variance indicates inconsistent pricing';
    }
    if (stability === 'VOLATILE') {
      return 'Consider standardizing prices - moderate variance detected';
    }
    if (stability === 'VERY_STABLE') {
      return 'Excellent price consistency - maintain current strategy';
    }
    return 'Monitor pricing - some variance is acceptable';
  }
}

module.exports = new EnhancedReportService();