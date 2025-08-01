const mongoose = require('mongoose');
const InvoiceOverview = require('../billing/invoice/invoiceOverview.model');
const InvoiceDetails = require('../billing/invoice/invoiceDetails.model');
const Payment = require('../billing/payment/payment.model');
const Client = require('../client/client.model');
const ClientOutstanding = require('../billing/clientOutstanding/clientOutstanding.model');

const formatDate = require('../../utils/dateUtils').formatDate;

  // Equivalent to sp_get_all_sell_in_period + Java service enrichment
  const getSellsReport = async (fromDate, toDate) =>  {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Get raw sell stats (equivalent to stored procedure)
      const sellStats = await InvoiceOverview.find({
        invoiceDate: { $gte: from, $lte: to }
      })
      .select('invoiceId clientId invoiceDate subTotalAmount taxAmount discountAmount grandTotalAmount')
      .lean();

      if (sellStats.length === 0) {
        return [];
      }

      // Get unique client IDs
      const clientIds = [...new Set(sellStats.map(stat => stat.clientId))];
      
      // Get client info (equivalent to clientServiceProxy.getAllClient)
      const clients = await Client.find({ 
        clientId: { $in: clientIds } 
      })
      .select('clientId clientName mobile email')
      .lean();

      // Create client lookup map
      const clientMap = {};
      clients.forEach(client => {
        clientMap[client.clientId] = client;
      });

      // Build response (equivalent to Java service transformation)
      const sellStatsResponses = sellStats.map(sellStat => {
        const client = clientMap[sellStat.clientId] || {};
        return {
          invoiceId: sellStat.invoiceId,
          clientId: sellStat.clientId,
          clientName: client.clientName || 'Unknown',
          mobile: client.mobile || '',
          invoiceDate: formatDate(sellStat.invoiceDate),
          subTotalAmount: sellStat.subTotalAmount,
          taxAmount: sellStat.taxAmount,
          discountAmount: sellStat.discountAmount,
          grandTotalAmount: sellStat.grandTotalAmount
        };
      });

      return sellStatsResponses;
    } catch (error) {
      throw new Error(`Error fetching sells report: ${error.message}`);
    }
  }

  // Equivalent to sp_get_all_collection_in_period + Java service enrichment
  const getCollectionsReport = async (fromDate, toDate) => {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Get raw collection stats (equivalent to stored procedure)
      const collectionStats = await Payment.find({
        paymentDate: { $gte: from, $lte: to },
        amount: { $gt: 0 }
      })
      .select('paymentId clientId amount paymentMode paymentDate')
      .lean();

      if (collectionStats.length === 0) {
        return [];
      }

      // Get unique client IDs
      const clientIds = [...new Set(collectionStats.map(stat => stat.clientId))];
      
      // Get client info
      const clients = await Client.find({ 
        clientId: { $in: clientIds } 
      })
      .select('clientId clientName mobile email')
      .lean();

      // Create client lookup map
      const clientMap = {};
      clients.forEach(client => {
        clientMap[client.clientId] = client;
      });

      // Build response
      const collectionStatsResponses = collectionStats.map(collectionStat => {
        const client = clientMap[collectionStat.clientId] || {};
        return {
          paymentId: collectionStat.paymentId,
          clientId: collectionStat.clientId,
          clientName: client.clientName || 'Unknown',
          mobile: client.mobile || '',
          amount: collectionStat.amount,
          paymentMode: collectionStat.paymentMode,
          paymentDate: formatDate(collectionStat.paymentDate)
        };
      });

      return collectionStatsResponses;
    } catch (error) {
      throw new Error(`Error fetching collections report: ${error.message}`);
    }
  };

  // Equivalent to sp_get_client_collection_in_period + enrichment
  const getClientCollectionsReport = async (fromDate, toDate, clientId) => {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      const collectionStats = await Payment.find({
        clientId: clientId,
        paymentDate: { $gte: from, $lte: to },
        amount: { $gt: 0 }
      })
      .select('paymentId clientId amount paymentMode paymentDate')
      .lean();

      // Get client info
      const client = await Client.findOne({ clientId: clientId })
        .select('clientId clientName mobile email')
        .lean();

      // Build response
      const collectionStatsResponses = collectionStats.map(collectionStat => ({
        paymentId: collectionStat.paymentId,
        clientId: collectionStat.clientId,
        clientName: client?.clientName || 'Unknown',
        mobile: client?.mobile || '',
        amount: collectionStat.amount,
        paymentMode: collectionStat.paymentMode,
        paymentDate: formatDate(collectionStat.paymentDate)
      }));

      return collectionStatsResponses;
    } catch (error) {
      throw new Error(`Error fetching client collections report: ${error.message}`);
    }
  };

  // Equivalent to sp_get_client_sell_in_period + enrichment
  const getClientSellsReport = async (fromDate, toDate, clientId) => {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      const sellStats = await InvoiceOverview.find({
        clientId: clientId,
        invoiceDate: { $gte: from, $lte: to }
      })
      .select('invoiceId clientId invoiceDate subTotalAmount taxAmount discountAmount grandTotalAmount')
      .lean();

      // Get client info
      const client = await Client.findOne({ clientId: clientId })
        .select('clientId clientName mobile email')
        .lean();

      // Build response
      const sellStatsResponses = sellStats.map(sellStat => ({
        invoiceId: sellStat.invoiceId,
        clientId: sellStat.clientId,
        clientName: client?.clientName || 'Unknown',
        mobile: client?.mobile || '',
        invoiceDate: formatDate(sellStat.invoiceDate),
        subTotalAmount: sellStat.subTotalAmount,
        taxAmount: sellStat.taxAmount,
        discountAmount: sellStat.discountAmount,
        grandTotalAmount: sellStat.grandTotalAmount
      }));

      return sellStatsResponses;
    } catch (error) {
      throw new Error(`Error fetching client sells report: ${error.message}`);
    }
  }

  // Combined client report (equivalent to Java getClientReport method)
  const getClientReport = async (fromDate, toDate, clientId) => {
    try {
      const [clientCollection, clientSell] = await Promise.all([
        getClientCollectionsReport(fromDate, toDate, clientId),
        getClientSellsReport(fromDate, toDate, clientId)
      ]);

      return {
        clientCollection,
        clientSell
      };
    } catch (error) {
      throw new Error(`Error fetching client report: ${error.message}`);
    }
  };

  // Equivalent to sp_get_tradebook_stats_in_period + enrichment
  const getTradeBookReport = async (fromDate, toDate) => {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Get invoices (Purchase transactions)
      const invoices = await InvoiceOverview.find({
        invoiceDate: { $gte: from, $lte: to }
      })
      .select('invoiceId clientId grandTotalAmount invoiceDate')
      .lean();

      // Get payments (Payment transactions)
      const payments = await Payment.find({
        paymentDate: { $gte: from, $lte: to },
        amount: { $gt: 0 }
      })
      .select('paymentId clientId amount paymentDate')
      .lean();

      // Combine transactions
      const tradeBooks = [];
      
      // Add invoice transactions
      invoices.forEach(invoice => {
        tradeBooks.push({
          id: invoice.invoiceId,
          clientId: invoice.clientId,
          amount: invoice.grandTotalAmount,
          billPaymentDate: formatDate(invoice.invoiceDate),
          transactionType: 'Purchase'
        });
      });

      // Add payment transactions
      payments.forEach(payment => {
        tradeBooks.push({
          id: payment.paymentId,
          clientId: payment.clientId,
          amount: payment.amount,
          billPaymentDate: formatDate(payment.paymentDate),
          transactionType: 'Payment'
        });
      });

      if (tradeBooks.length === 0) {
        return [];
      }

      // Get unique client IDs
      const clientIds = [...new Set(tradeBooks.map(trade => trade.clientId))];
      
      // Get client info
      const clients = await Client.find({ 
        clientId: { $in: clientIds } 
      })
      .select('clientId clientName')
      .lean();

      // Create client lookup map
      const clientMap = {};
      clients.forEach(client => {
        clientMap[client.clientId] = client;
      });

      // Build response
      const tradeBookResponses = tradeBooks.map(tradeBook => {
        const client = clientMap[tradeBook.clientId] || {};
        return {
          id: tradeBook.id,
          clientId: tradeBook.clientId,
          clientName: client.clientName || 'Unknown',
          amount: tradeBook.amount,
          billPaymentDate: tradeBook.billPaymentDate,
          transactionType: tradeBook.transactionType
        };
      });

      return tradeBookResponses;
    } catch (error) {
      throw new Error(`Error fetching trade book report: ${error.message}`);
    }
  };

  // Equivalent to sp_get_particulars_report_in_period
  const getParticularsReport = async (fromDate, toDate) => {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      const pipeline = [
        {
          $match: {
            createdDate: { $gte: from, $lte: to }
          }
        },
        {
          $group: {
            _id: '$perticulars',
            totalSell: { $sum: '$discountTotal' }
          }
        },
        {
          $sort: { totalSell: -1 }
        },
        {
          $project: {
            _id: 0,
            particulars: '$_id',
            totalSell: 1
          }
        }
      ];
      
      const result = await InvoiceDetails.aggregate(pipeline);
      return result;
    } catch (error) {
      throw new Error(`Error fetching particulars report: ${error.message}`);
    }
  };

  // Equivalent to sp_get_all_clients_outstanding + Java service transformation
  const getClientOutstandingReport = async () => {
    try {
      // Get client outstanding data with client names
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
          $project: {
            clientId: 1,
            clientName: { $ifNull: ['$clientInfo.clientName', 'Unknown'] },
            purchasedAmount: 1,
            paymentAmount: 1,
            outstandingAmount: { $subtract: ['$purchasedAmount', '$paymentAmount'] }
          }
        },
        {
          $match: {
            outstandingAmount: { $ne: 0 }
          }
        },
        {
          $sort: { outstandingAmount: -1 }
        }
      ];

      const clientOutstandingAmounts = await ClientOutstanding.aggregate(pipeline);

      // Add row numbers (equivalent to @rownum in SQL)
      const clientOutstandingAmountsWithSlNo = clientOutstandingAmounts.map((item, index) => ({
        slNo: index + 1,
        clientName: item.clientName,
        purchasedAmount: Math.ceil(item.purchasedAmount),
        paymentAmount: Math.ceil(item.paymentAmount),
        outstandingAmount: Math.ceil(item.outstandingAmount)
      }));

      // Calculate summary totals (equivalent to Java service logic)
      const purchasedAmount = clientOutstandingAmountsWithSlNo.reduce((sum, item) => sum + item.purchasedAmount, 0);
      const paymentAmount = clientOutstandingAmountsWithSlNo.reduce((sum, item) => sum + item.paymentAmount, 0);
      const outstandingAmount = clientOutstandingAmountsWithSlNo.reduce((sum, item) => sum + item.outstandingAmount, 0);


      const clientOutstandingAmountSummary = [
        { name: 'PurchasedAmount', value: purchasedAmount },
        { name: 'PaymentAmount', value: paymentAmount },
        { name: 'OutstandingAmount', value: outstandingAmount }
      ];

      return {
        clientOutstandingAmountSummary,
        clientOutstandingAmount: clientOutstandingAmountsWithSlNo
      };
    } catch (error) {
      throw new Error(`Error fetching client outstanding report: ${error.message}`);
    }
  };

  // Equivalent to sp_get_client_trade_book_in_period + Java service transformation
  const getClientTradeBookReport = async (clientId, fromDate, toDate) => {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Calculate opening balance (equivalent to opening balance query in stored procedure)
      const [invoiceSum, paymentSum] = await Promise.all([
        InvoiceOverview.aggregate([
          {
            $match: {
              clientId: clientId,
              invoiceDate: { $lt: from }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$grandTotalAmount' }
            }
          }
        ]),
        Payment.aggregate([
          {
            $match: {
              clientId: clientId,
              paymentDate: { $lt: from }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ])
      ]);

      const openingBalance = (invoiceSum[0]?.total || 0) - (paymentSum[0]?.total || 0);

      // Get transactions in period
      const [invoices, payments] = await Promise.all([
        InvoiceOverview.find({
          clientId: clientId,
          invoiceDate: { $gte: from, $lte: to }
        })
        .select('invoiceId clientId grandTotalAmount invoiceDate subTotalAmount discountAmount')
        .lean(),
        Payment.find({
          clientId: clientId,
          paymentDate: { $gte: from, $lte: to },
          amount: { $gt: 0 }
        })
        .select('paymentId clientId amount paymentDate')
        .lean()
      ]);

      // Build transactions array
      const transactions = [];

      // Add opening balance
      transactions.push({
        clientId: clientId,
        id: -99,
        amount: openingBalance,
        date: formatDate(from),
        type: 'OpeningBalance',
        remark: 'Opening Balance'
      });

      // Add invoice transactions
      invoices.forEach(invoice => {
        const remark = invoice.discountAmount > 0 
          ? `Invoice #${invoice.invoiceId} (bill #${invoice.subTotalAmount} discount #${invoice.discountAmount})`
          : `Invoice #${invoice.invoiceId} (Nett)`;
        
        transactions.push({
          clientId: invoice.clientId,
          id: invoice.invoiceId,
          amount: Math.round(invoice.grandTotalAmount * 100) / 100,
          date: formatDate(invoice.invoiceDate),
          type: 'Purchase',
          remark: remark
        });
      });

      // Add payment transactions
      payments.forEach(payment => {
        transactions.push({
          clientId: payment.clientId,
          id: payment.paymentId,
          amount: Math.round(payment.amount * 100) / 100,
          date: formatDate(payment.paymentDate),
          type: 'Payment',
          remark: `Payment #${payment.paymentId}`
        });
      });

      // Sort by date
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculate running balance and build response (equivalent to Java service logic)
      let balance = 0;
      const clientTradeBookResponses = transactions.map(transaction => {
        if (transaction.type === 'Purchase') {
          balance += transaction.amount;
          return {
            billAmount: `+ ${transaction.amount}`,
            paymentAmount: null,
            date: formatDate(transaction.date),
            type: transaction.type,
            remark: transaction.remark,
            balance: balance
          };
        } else if (transaction.type === 'Payment') {
          balance -= transaction.amount;
          return {
            billAmount: null,
            paymentAmount: `- ${transaction.amount}`,
            date: formatDate(transaction.date),
            type: transaction.type,
            remark: transaction.remark,
            balance: balance
          };
        } else { // OpeningBalance
          balance = transaction.amount;
          return {
            billAmount: null,
            paymentAmount: null,
            date: formatDate(transaction.date),
            type: transaction.type,
            remark: transaction.remark,
            balance: balance
          };
        }
      });

      return clientTradeBookResponses;
    } catch (error) {
      throw new Error(`Error fetching client trade book report: ${error.message}`);
    }
  };



module.exports = {
  getSellsReport,
  getCollectionsReport,
  getClientReport,
  getTradeBookReport,
  getParticularsReport,
  getClientOutstandingReport,
  getClientTradeBookReport,
};