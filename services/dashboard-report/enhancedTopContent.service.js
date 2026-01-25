// ===================================
// ENHANCED TOP CONTENT SERVICE WITH PROFIT METRICS
// File: services/dashboard-report/enhancedTopContent.service.js
// ===================================

const mongoose = require("mongoose");
const InvoiceOverview = require("../billing/invoice/invoiceOverview.model");
const InvoiceDetails = require("../billing/invoice/invoiceDetails.model");
const Payment = require("../billing/payment/payment.model");
const Client = require("../client/client.model");
const ClientOutstanding = require("../billing/clientOutstanding/clientOutstanding.model");
const SaleProfit = require("../profit/profit.model");
const Product = require("../product/product.model");
const Inventory = require("../inventory/inventory.model");

class EnhancedTopContentService {

  // Enhanced top selling products with profit metrics
  async getTopSellingProductsWithProfit(topCount = 10) {
    try {
      const pipeline = [
        {
          $lookup: {
            from: 'saleprofits',
            localField: 'perticulars',
            foreignField: 'productName',
            as: 'profitData'
          }
        },
        {
          $group: {
            _id: "$perticulars",
            totalSell: { $sum: "$discountTotal" },
            totalQuantity: { $sum: "$quanity" },
            salesCount: { $sum: 1 },
            avgPrice: { $avg: "$discountTotal" },
            totalProfit: { $sum: { $sum: "$profitData.grossProfit" } },
            avgProfitMargin: { $avg: { $avg: "$profitData.profitPercentage" } }
          }
        },
        {
          $addFields: {
            profitPerUnit: {
              $cond: {
                if: { $gt: ["$totalQuantity", 0] },
                then: { $divide: ["$totalProfit", "$totalQuantity"] },
                else: 0
              }
            },
            profitMargin: {
              $cond: {
                if: { $gt: ["$totalSell", 0] },
                then: { $multiply: [{ $divide: ["$totalProfit", "$totalSell"] }, 100] },
                else: 0
              }
            }
          }
        },
        {
          $sort: { totalSell: -1 }
        },
        {
          $limit: topCount
        },
        {
          $project: {
            _id: 0,
            productName: "$_id",
            totalSell: { $ceil: "$totalSell" },
            totalQuantity: "$totalQuantity",
            salesCount: "$salesCount",
            avgPrice: { $round: ["$avgPrice", 2] },
            totalProfit: { $round: ["$totalProfit", 2] },
            avgProfitMargin: { $round: ["$avgProfitMargin", 2] },
            profitPerUnit: { $round: ["$profitPerUnit", 2] },
            profitabilityRating: {
              $switch: {
                branches: [
                  { case: { $gte: ["$avgProfitMargin", 40] }, then: "EXCELLENT" },
                  { case: { $gte: ["$avgProfitMargin", 25] }, then: "GOOD" },
                  { case: { $gte: ["$avgProfitMargin", 15] }, then: "AVERAGE" },
                  { case: { $gte: ["$avgProfitMargin", 5] }, then: "LOW" }
                ],
                default: "POOR"
              }
            }
          }
        }
      ];

      const result = await InvoiceDetails.aggregate(pipeline);
      return result;
    } catch (error) {
      throw new Error(`Error fetching enhanced top selling products: ${error.message}`);
    }
  }

  // Enhanced top buyers with profitability analysis
  async getTopBuyersWithProfit(topCount = 10) {
    try {
      const pipeline = [
        {
          $lookup: {
            from: "client",
            localField: "clientId",
            foreignField: "clientId",
            as: "clientInfo",
          },
        },
        {
          $unwind: {
            path: "$clientInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "saleprofits",
            localField: "clientId",
            foreignField: "clientId",
            as: "profitData",
          },
        },
        {
          $group: {
            _id: "$clientId",
            clientName: { $first: "$clientInfo.clientName" },
            mobile: { $first: "$clientInfo.mobile" },
            totalPurchasedAmount: { $sum: "$purchasedAmount" },
            totalPaymentAmount: { $sum: "$paymentAmount" },
            outstandingAmount: { $sum: { $subtract: ["$purchasedAmount", "$paymentAmount"] } },
            totalProfit: { $sum: { $sum: "$profitData.grossProfit" } },
            avgProfitMargin: { $avg: { $avg: "$profitData.profitPercentage" } },
            transactionCount: { $sum: { $size: "$profitData" } }
          },
        },
        {
          $addFields: {
            profitabilityScore: {
              $multiply: [
                { $divide: ["$totalProfit", "$totalPurchasedAmount"] },
                100
              ]
            },
            avgOrderValue: {
              $cond: {
                if: { $gt: ["$transactionCount", 0] },
                then: { $divide: ["$totalPurchasedAmount", "$transactionCount"] },
                else: 0
              }
            },
            clientStatus: {
              $switch: {
                branches: [
                  { case: { $gt: ["$outstandingAmount", 10000] }, then: "HIGH_OUTSTANDING" },
                  { case: { $gt: ["$outstandingAmount", 5000] }, then: "MODERATE_OUTSTANDING" },
                  { case: { $gt: ["$outstandingAmount", 0] }, then: "LOW_OUTSTANDING" },
                  { case: { $eq: ["$outstandingAmount", 0] }, then: "CLEAR" }
                ],
                default: "CREDIT"
              }
            }
          }
        },
        {
          $sort: { totalPurchasedAmount: -1 }
        },
        {
          $limit: topCount
        },
        {
          $project: {
            _id: 0,
            clientId: "$_id",
            clientName: { $ifNull: ["$clientName", "Unknown"] },
            mobile: { $ifNull: ["$mobile", ""] },
            totalPurchasedAmount: { $ceil: "$totalPurchasedAmount" },
            totalPaymentAmount: { $ceil: "$totalPaymentAmount" },
            outstandingAmount: { $ceil: "$outstandingAmount" },
            totalProfit: { $round: ["$totalProfit", 2] },
            avgProfitMargin: { $round: ["$avgProfitMargin", 2] },
            profitabilityScore: { $round: ["$profitabilityScore", 2] },
            avgOrderValue: { $round: ["$avgOrderValue", 2] },
            transactionCount: "$transactionCount",
            clientStatus: "$clientStatus"
          }
        }
      ];

      const result = await ClientOutstanding.aggregate(pipeline);
      return result;
    } catch (error) {
      throw new Error(`Error fetching enhanced top buyers: ${error.message}`);
    }
  }

  // Enhanced monthly sell stats with profit breakdown
  async getMonthlySellStatsWithProfit() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      // Get sales data
      const salesPipeline = [
        {
          $match: {
            invoiceDate: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, currentMonth - 1, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$invoiceDate" },
            totalRevenue: { $sum: "$grandTotalAmount" },
            transactionCount: { $sum: 1 }
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];

      // Get profit data
      const profitPipeline = [
        {
          $match: {
            saleDate: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, currentMonth - 1, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$saleDate" },
            totalProfit: { $sum: "$grossProfit" },
            totalCost: { $sum: "$totalCost" },
            avgProfitMargin: { $avg: "$profitPercentage" }
          },
        },
        {
          $sort: { _id: 1 },
        },
      ];

      const [salesData, profitData] = await Promise.all([
        InvoiceOverview.aggregate(salesPipeline),
        SaleProfit.aggregate(profitPipeline)
      ]);

      // Combine data
      const result = [];
      for (let month = 1; month <= currentMonth; month++) {
        const salesMonth = salesData.find((item) => item._id === month);
        const profitMonth = profitData.find((item) => item._id === month);
        
        const revenue = salesMonth ? salesMonth.totalRevenue : 0;
        const profit = profitMonth ? profitMonth.totalProfit : 0;
        const cost = profitMonth ? profitMonth.totalCost : 0;
        
        result.push({
          month: monthNames[month - 1],
          totalRevenue: Math.round(revenue * 100) / 100,
          totalProfit: Math.round(profit * 100) / 100,
          totalCost: Math.round(cost * 100) / 100,
          profitMargin: cost > 0 ? Math.round((profit / cost) * 10000) / 100 : 0,
          transactionCount: salesMonth ? salesMonth.transactionCount : 0,
          avgProfitMargin: profitMonth ? Math.round(profitMonth.avgProfitMargin * 100) / 100 : 0
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Error fetching enhanced monthly stats: ${error.message}`);
    }
  }

  // Enhanced dashboard summary with profit metrics
  async getEnhancedDashboardSummary(year) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      // Get sales data
      const salesPipeline = [
        {
          $match: {
            invoiceDate: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalSell: { $sum: "$grandTotalAmount" },
            totalTransactions: { $sum: 1 },
            avgOrderValue: { $avg: "$grandTotalAmount" }
          },
        },
      ];

      // Get collection data
      const collectionPipeline = [
        {
          $match: {
            paymentDate: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalCollection: { $sum: "$amount" },
            paymentCount: { $sum: 1 }
          },
        },
      ];

      // Get profit data
      const profitPipeline = [
        {
          $match: {
            saleDate: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalProfit: { $sum: "$grossProfit" },
            totalCost: { $sum: "$totalCost" },
            avgProfitMargin: { $avg: "$profitPercentage" },
            profitTransactions: { $sum: 1 }
          },
        },
      ];

      const [salesResult, collectionResult, profitResult] = await Promise.all([
        InvoiceOverview.aggregate(salesPipeline),
        Payment.aggregate(collectionPipeline),
        SaleProfit.aggregate(profitPipeline)
      ]);

      const sales = salesResult[0] || { totalSell: 0, totalTransactions: 0, avgOrderValue: 0 };
      const collection = collectionResult[0] || { totalCollection: 0, paymentCount: 0 };
      const profit = profitResult[0] || { totalProfit: 0, totalCost: 0, avgProfitMargin: 0, profitTransactions: 0 };

      const outstanding = sales.totalSell - collection.totalCollection;
      const profitMargin = profit.totalCost > 0 ? (profit.totalProfit / profit.totalCost) * 100 : 0;

      const result = [
        {
          name: "Total Sales",
          value: Math.round(sales.totalSell * 100) / 100,
          type: "revenue",
          growth: "+12.5%", // Would be calculated from historical data
          icon: "trending-up"
        },
        {
          name: "Total Collection",
          value: Math.round(collection.totalCollection * 100) / 100,
          type: "collection",
          growth: "+8.3%",
          icon: "dollar-sign"
        },
        {
          name: "Total Profit",
          value: Math.round(profit.totalProfit * 100) / 100,
          type: "profit",
          growth: "+15.2%",
          icon: "trending-up"
        },
        {
          name: "Profit Margin",
          value: Math.round(profitMargin * 100) / 100,
          type: "percentage",
          growth: "+2.1%",
          icon: "percent"
        },
        {
          name: "Outstanding Amount",
          value: Math.round(outstanding * 100) / 100,
          type: "outstanding",
          growth: "-5.4%",
          icon: "clock"
        },
        {
          name: "Avg Order Value",
          value: Math.round(sales.avgOrderValue * 100) / 100,
          type: "average",
          growth: "+3.7%",
          icon: "shopping-cart"
        }
      ];

      return result;
    } catch (error) {
      throw new Error(`Error fetching enhanced dashboard summary: ${error.message}`);
    }
  }

  // Product performance with inventory insights
  async getProductPerformanceWithInventory() {
    try {
      const pipeline = [
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
            as: 'salesData'
          }
        },
        {
          $addFields: {
            totalSales: { $sum: '$salesData.totalRevenue' },
            totalProfit: { $sum: '$salesData.grossProfit' },
            avgProfitMargin: { $avg: '$salesData.profitPercentage' },
            salesCount: { $size: '$salesData' },
            lastSaleDate: { $max: '$salesData.saleDate' },
            turnoverRatio: {
              $cond: {
                if: { $gt: ['$totalValue', 0] },
                then: { $divide: [{ $sum: '$salesData.totalRevenue' }, '$totalValue'] },
                else: 0
              }
            }
          }
        },
        {
          $addFields: {
            performanceScore: {
              $add: [
                { $multiply: ['$turnoverRatio', 40] },
                { $multiply: [{ $divide: ['$avgProfitMargin', 100] }, 30] },
                { $multiply: [{ $divide: ['$salesCount', 10] }, 30] }
              ]
            },
            stockStatus: {
              $switch: {
                branches: [
                  { case: { $eq: ['$availableQuantity', 0] }, then: 'OUT_OF_STOCK' },
                  { case: { $lt: ['$availableQuantity', 10] }, then: 'LOW_STOCK' },
                  { case: { $gt: ['$availableQuantity', 100] }, then: 'EXCESS_STOCK' }
                ],
                default: 'NORMAL'
              }
            }
          }
        },
        {
          $sort: { performanceScore: -1 }
        },
        {
          $limit: 20
        }
      ];

      const result = await Inventory.aggregate(pipeline);
      
      return result.map(item => ({
        productId: item.productId,
        productName: item.productInfo?.productName || 'Unknown Product',
        category: item.productInfo?.category || 'Unknown',
        availableQuantity: item.availableQuantity,
        totalValue: Math.round(item.totalValue * 100) / 100,
        totalSales: Math.round(item.totalSales * 100) / 100,
        totalProfit: Math.round(item.totalProfit * 100) / 100,
        avgProfitMargin: Math.round(item.avgProfitMargin * 100) / 100,
        turnoverRatio: Math.round(item.turnoverRatio * 100) / 100,
        performanceScore: Math.round(item.performanceScore * 100) / 100,
        stockStatus: item.stockStatus,
        salesCount: item.salesCount,
        lastSaleDate: item.lastSaleDate ? new Date(item.lastSaleDate).toLocaleDateString() : 'Never'
      }));
    } catch (error) {
      throw new Error(`Error fetching product performance with inventory: ${error.message}`);
    }
  }

  // Client satisfaction metrics
  async getClientSatisfactionMetrics() {
    try {
      const pipeline = [
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
          $lookup: {
            from: 'saleprofits',
            localField: 'clientId',
            foreignField: 'clientId',
            as: 'profitData'
          }
        },
        {
          $lookup: {
            from: 'invoiceoverview',
            localField: 'clientId',
            foreignField: 'clientId',
            as: 'invoices'
          }
        },
        {
          $addFields: {
            totalTransactions: { $size: '$invoices' },
            avgOrderValue: { $avg: '$invoices.grandTotalAmount' },
            totalSpent: { $sum: '$invoices.grandTotalAmount' },
            avgProfitMargin: { $avg: '$profitData.profitPercentage' },
            lastOrderDate: { $max: '$invoices.invoiceDate' },
            daysSinceLastOrder: {
              $divide: [
                { $subtract: [new Date(), { $max: '$invoices.invoiceDate' }] },
                86400000
              ]
            }
          }
        },
        {
          $addFields: {
            loyaltyScore: {
              $add: [
                { $multiply: [{ $divide: ['$totalTransactions', 5] }, 30] },
                { $multiply: [{ $divide: ['$totalSpent', 10000] }, 25] },
                { 
                  $cond: {
                    if: { $lt: ['$daysSinceLastOrder', 30] },
                    then: 25,
                    else: { $cond: { if: { $lt: ['$daysSinceLastOrder', 90] }, then: 15, else: 5 } }
                  }
                },
                { $multiply: [{ $divide: ['$avgOrderValue', 1000] }, 20] }
              ]
            },
            clientTier: {
              $switch: {
                branches: [
                  { case: { $gte: ['$totalSpent', 50000] }, then: 'PLATINUM' },
                  { case: { $gte: ['$totalSpent', 25000] }, then: 'GOLD' },
                  { case: { $gte: ['$totalSpent', 10000] }, then: 'SILVER' }
                ],
                default: 'BRONZE'
              }
            }
          }
        },
        {
          $sort: { loyaltyScore: -1 }
        },
        {
          $limit: 15
        }
      ];

      const result = await ClientOutstanding.aggregate(pipeline);
      
      return result.map(client => ({
        clientId: client.clientId,
        clientName: client.clientInfo?.clientName || 'Unknown',
        mobile: client.clientInfo?.mobile || '',
        clientTier: client.clientTier,
        loyaltyScore: Math.round(client.loyaltyScore * 100) / 100,
        totalTransactions: client.totalTransactions,
        totalSpent: Math.round(client.totalSpent * 100) / 100,
        avgOrderValue: Math.round(client.avgOrderValue * 100) / 100,
        avgProfitMargin: Math.round(client.avgProfitMargin * 100) / 100,
        daysSinceLastOrder: Math.floor(client.daysSinceLastOrder || 0),
        lastOrderDate: client.lastOrderDate ? new Date(client.lastOrderDate).toLocaleDateString() : 'Never',
        outstandingAmount: Math.round((client.purchasedAmount - client.paymentAmount) * 100) / 100
      }));
    } catch (error) {
      throw new Error(`Error fetching client satisfaction metrics: ${error.message}`);
    }
  }

  // Business health indicators
  async getBusinessHealthIndicators() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const [
        currentPeriodSales,
        previousPeriodSales,
        currentPeriodProfit,
        previousPeriodProfit,
        inventoryValue,
        outstandingAmount
      ] = await Promise.all([
        // Current 30 days sales
        InvoiceOverview.aggregate([
          { $match: { invoiceDate: { $gte: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: '$grandTotalAmount' }, count: { $sum: 1 } } }
        ]),
        // Previous 30 days sales
        InvoiceOverview.aggregate([
          { $match: { invoiceDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: '$grandTotalAmount' }, count: { $sum: 1 } } }
        ]),
        // Current 30 days profit
        SaleProfit.aggregate([
          { $match: { saleDate: { $gte: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: '$grossProfit' }, avgMargin: { $avg: '$profitPercentage' } } }
        ]),
        // Previous 30 days profit
        SaleProfit.aggregate([
          { $match: { saleDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: '$grossProfit' }, avgMargin: { $avg: '$profitPercentage' } } }
        ]),
        // Total inventory value
        Inventory.aggregate([
          { $group: { _id: null, total: { $sum: '$totalValue' } } }
        ]),
        // Total outstanding
        ClientOutstanding.aggregate([
          { $group: { _id: null, total: { $sum: { $subtract: ['$purchasedAmount', '$paymentAmount'] } } } }
        ])
      ]);

      const currentSales = currentPeriodSales[0] || { total: 0, count: 0 };
      const previousSales = previousPeriodSales[0] || { total: 0, count: 0 };
      const currentProfit = currentPeriodProfit[0] || { total: 0, avgMargin: 0 };
      const previousProfit = previousPeriodProfit[0] || { total: 0, avgMargin: 0 };
      const inventory = inventoryValue[0] || { total: 0 };
      const outstanding = outstandingAmount[0] || { total: 0 };

      // Calculate growth rates
      const salesGrowth = previousSales.total > 0 
        ? ((currentSales.total - previousSales.total) / previousSales.total) * 100 
        : 0;
      
      const profitGrowth = previousProfit.total > 0 
        ? ((currentProfit.total - previousProfit.total) / previousProfit.total) * 100 
        : 0;

      const marginChange = currentProfit.avgMargin - previousProfit.avgMargin;

      // Health score calculation
      const healthScore = Math.min(100, Math.max(0, 
        50 + // Base score
        (salesGrowth > 0 ? 15 : -10) + // Sales growth impact
        (profitGrowth > 0 ? 15 : -10) + // Profit growth impact
        (marginChange > 0 ? 10 : -5) + // Margin improvement
        (outstanding.total < currentSales.total * 0.2 ? 10 : -5) // Outstanding ratio
      ));

      return {
        healthScore: Math.round(healthScore),
        metrics: {
          salesGrowth: Math.round(salesGrowth * 100) / 100,
          profitGrowth: Math.round(profitGrowth * 100) / 100,
          marginChange: Math.round(marginChange * 100) / 100,
          inventoryTurnover: inventory.total > 0 ? Math.round((currentSales.total / inventory.total) * 100) / 100 : 0,
          outstandingRatio: currentSales.total > 0 ? Math.round((outstanding.total / currentSales.total) * 100) / 100 : 0
        },
        indicators: {
          sales: salesGrowth > 5 ? 'EXCELLENT' : salesGrowth > 0 ? 'GOOD' : salesGrowth > -5 ? 'FAIR' : 'POOR',
          profit: profitGrowth > 10 ? 'EXCELLENT' : profitGrowth > 0 ? 'GOOD' : profitGrowth > -5 ? 'FAIR' : 'POOR',
          margin: marginChange > 2 ? 'IMPROVING' : marginChange > -1 ? 'STABLE' : 'DECLINING',
          cash: outstanding.total < currentSales.total * 0.15 ? 'HEALTHY' : outstanding.total < currentSales.total * 0.3 ? 'MODERATE' : 'CONCERNING'
        },
        recommendations: this.generateHealthRecommendations(salesGrowth, profitGrowth, marginChange, outstanding.total / currentSales.total)
      };
    } catch (error) {
      throw new Error(`Error fetching business health indicators: ${error.message}`);
    }
  }

  // Generate health recommendations
  generateHealthRecommendations(salesGrowth, profitGrowth, marginChange, outstandingRatio) {
    const recommendations = [];

    if (salesGrowth < 0) {
      recommendations.push({
        type: 'SALES',
        priority: 'HIGH',
        message: 'Sales declining - Review marketing strategy and customer retention'
      });
    }

    if (profitGrowth < 0) {
      recommendations.push({
        type: 'PROFIT',
        priority: 'HIGH',
        message: 'Profit declining - Analyze cost structure and pricing strategy'
      });
    }

    if (marginChange < -2) {
      recommendations.push({
        type: 'MARGIN',
        priority: 'MEDIUM',
        message: 'Profit margins shrinking - Review supplier costs and pricing'
      });
    }

    if (outstandingRatio > 0.3) {
      recommendations.push({
        type: 'CASH_FLOW',
        priority: 'HIGH',
        message: 'High outstanding amount - Improve collection processes'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'GENERAL',
        priority: 'LOW',
        message: 'Business metrics looking healthy - Continue current strategies'
      });
    }

    return recommendations;
  }
}

module.exports = new EnhancedTopContentService();