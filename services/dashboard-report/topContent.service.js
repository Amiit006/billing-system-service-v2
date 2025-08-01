const mongoose = require("mongoose");
const InvoiceOverview = require("../billing/invoice/invoiceOverview.model");
const InvoiceDetails = require("../billing/invoice/invoiceDetails.model");
const Payment = require("../billing/payment/payment.model");
const Client = require("../client/client.model");
const ClientOutstanding = require("../billing/clientOutstanding/clientOutstanding.model");

// Equivalent to sp_top_selling_products
const getTopSellingProducts = async (topCount) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$perticulars",
          totalSell: { $sum: "$discountTotal" },
        },
      },
      {
        $sort: { totalSell: -1 },
      },
      {
        $limit: topCount,
      },
      {
        $project: {
          _id: 0,
          perticulars: "$_id",
          totalSell: 1,
        },
      },
    ];

    const result = await InvoiceDetails.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new Error(`Error fetching top selling products: ${error.message}`);
  }
};

// Equivalent to sp_top_buyer
const getTopBuyer = async (topCount) => {
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
        $group: {
          _id: "$clientId",
          clientName: { $first: "$clientInfo.clientName" },
          totalPurchasedAmount: { $sum: "$purchasedAmount" },
          totalPaymentAmount: { $sum: "$paymentAmount" },
        },
      },
      {
        $sort: { totalPurchasedAmount: -1 },
      },
      {
        $limit: topCount,
      },
      {
        $project: {
          _id: 0,
          clientName: { $ifNull: ["$clientName", "Unknown"] },
          totalPurchasedAmount: 1,
          totalPaymentAmount: 1,
        },
      },
    ];

    const result = await ClientOutstanding.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new Error(`Error fetching top buyers: ${error.message}`);
  }
};

// Equivalent to sp_get_toal_sell_collection_stats
const getSellCollectionStats = async (year) => {
  try {
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

    // Get total sell for the year
    const sellPipeline = [
      {
        $match: {
          invoiceDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSell: { $sum: "$grandTotalAmount" },
        },
      },
    ];

    // Get total collection for the year
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
        },
      },
    ];

    const [sellResult, collectionResult] = await Promise.all([
      InvoiceOverview.aggregate(sellPipeline),
      Payment.aggregate(collectionPipeline),
    ]);

    const result = [
      {
        name: "Total Sell",
        value: sellResult[0]?.totalSell || 0,
      },
      {
        name: "Total Collection",
        value: collectionResult[0]?.totalCollection || 0,
      },
    ];

    return result;
  } catch (error) {
    throw new Error(`Error fetching sell collection stats: ${error.message}`);
  }
};

// Equivalent to sp_get_total_sell_per_month_for_one_year
const getMonthlySellStats = async () => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    // Month names mapping
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const pipeline = [
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
          value: { $sum: "$grandTotalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const mongoResult = await InvoiceOverview.aggregate(pipeline);

    // Create result array with all months up to current month
    const result = [];
    for (let month = 1; month <= currentMonth; month++) {
      const monthData = mongoResult.find((item) => item._id === month);
      result.push({
        name: monthNames[month - 1],
        value: monthData ? monthData.value : 0,
      });
    }

    return result;
  } catch (error) {
    throw new Error(`Error fetching monthly sell stats: ${error.message}`);
  }
};

// Equivalent to sp_get_sell_total_stats
const getSellStats = async (fromDate, toDate) => {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    const pipeline = [
      {
        $match: {
          invoiceDate: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          subTotalAmount: { $sum: "$subTotalAmount" },
          discountAmount: { $sum: "$discountAmount" },
          grandTotalAmount: { $sum: "$grandTotalAmount" },
        },
      },
    ];

    const mongoResult = await InvoiceOverview.aggregate(pipeline);
    const data = mongoResult[0] || {
      subTotalAmount: 0,
      discountAmount: 0,
      grandTotalAmount: 0,
    };

    const result = [
      {
        name: "Sub Total Amount",
        value: data.subTotalAmount,
      },
      {
        name: "Discount Amount",
        value: data.discountAmount,
      },
      {
        name: "Total Sell",
        value: data.grandTotalAmount,
      },
    ];

    return result;
  } catch (error) {
    throw new Error(`Error fetching sell stats: ${error.message}`);
  }
};

// Equivalent to sp_get_collection_total_stats
const getCollectionStats = async (fromDate, toDate) => {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Get total sell in period
    const sellPipeline = [
      {
        $match: {
          invoiceDate: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalSell: { $sum: "$grandTotalAmount" },
        },
      },
    ];

    // Get total collection in period
    const collectionPipeline = [
      {
        $match: {
          paymentDate: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalCollection: { $sum: "$amount" },
        },
      },
    ];

    const [sellResult, collectionResult] = await Promise.all([
      InvoiceOverview.aggregate(sellPipeline),
      Payment.aggregate(collectionPipeline),
    ]);

    const result = [
      {
        name: "Total Sell",
        value: sellResult[0]?.totalSell || 0,
      },
      {
        name: "Total Collection",
        value: collectionResult[0]?.totalCollection || 0,
      },
    ];

    return result;
  } catch (error) {
    throw new Error(`Error fetching collection stats: ${error.message}`);
  }
};

// Equivalent to sp_get_sell_col_by_client_stats
const getSellCollectionStatsByClientId = async (fromDate, toDate, clientId) => {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Get total sell for client in period
    const sellPipeline = [
      {
        $match: {
          clientId: clientId,
          invoiceDate: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalSell: { $sum: "$grandTotalAmount" },
        },
      },
    ];

    // Get total collection for client in period
    const collectionPipeline = [
      {
        $match: {
          clientId: clientId,
          paymentDate: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalCollection: { $sum: "$amount" },
        },
      },
    ];

    const [sellResult, collectionResult] = await Promise.all([
      InvoiceOverview.aggregate(sellPipeline),
      Payment.aggregate(collectionPipeline),
    ]);

    const totalSell = sellResult[0]?.totalSell || 0;
    const totalCollection = collectionResult[0]?.totalCollection || 0;
    const outstandingAmount = totalSell - totalCollection;

    const result = [
      {
        name: "Total Sell",
        value: totalSell,
      },
      {
        name: "Total Collection",
        value: totalCollection,
      },
      {
        name: "Outstanding Amount",
        value: outstandingAmount,
      },
    ];

    return result;
  } catch (error) {
    throw new Error(
      `Error fetching sell collection stats by client: ${error.message}`
    );
  }
};

// Equivalent to sp_get_client_outstanding_stats
const getClientOutstanding = async (clientId) => {
  try {
    // Get total bill amount and discount for client
    const invoicePipeline = [
      {
        $match: { clientId: clientId },
      },
      {
        $group: {
          _id: null,
          totalBillAmount: { $sum: "$subTotalAmount" },
          totalDiscountAmount: { $sum: "$discountAmount" },
        },
      },
    ];

    // Get total collection for client
    const paymentPipeline = [
      {
        $match: { clientId: clientId },
      },
      {
        $group: {
          _id: null,
          totalCollection: { $sum: "$amount" },
        },
      },
    ];

    const [invoiceResult, paymentResult] = await Promise.all([
      InvoiceOverview.aggregate(invoicePipeline),
      Payment.aggregate(paymentPipeline),
    ]);

    const totalBillAmount = invoiceResult[0]?.totalBillAmount || 0;
    const totalDiscountAmount = invoiceResult[0]?.totalDiscountAmount || 0;
    const totalCollection = paymentResult[0]?.totalCollection || 0;
    const outstandingAmount =
      totalBillAmount - totalDiscountAmount - totalCollection;

    const result = [
      {
        name: "Total Bill Amount",
        value: totalBillAmount,
      },
      {
        name: "Total Discount",
        value: totalDiscountAmount,
      },
      {
        name: "Total Collection",
        value: totalCollection,
      },
      {
        name: "Outstanding Amount",
        value: outstandingAmount,
      },
    ];

    return result;
  } catch (error) {
    throw new Error(`Error fetching client outstanding: ${error.message}`);
  }
};

// Equivalent to sp_get_sell_by_day_for_one_year
const getSellForOneYearByDayReport = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const pipeline = [
      {
        $match: {
          createdDate: { $gt: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdDate" },
          },
          value: { $sum: "$grandTotalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
    ];

    const result = await InvoiceOverview.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new Error(`Error fetching sell by day report: ${error.message}`);
  }
};

module.exports = {
  getTopSellingProducts,
  getTopBuyer,
  getSellCollectionStats,
  getMonthlySellStats,
  getSellStats,
  getCollectionStats,
  getSellCollectionStatsByClientId,
  getClientOutstanding,
  getSellForOneYearByDayReport,
};
