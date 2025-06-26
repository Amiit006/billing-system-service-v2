const ClientOutstanding = require('../models/clientOutstanding.model');
const ClientOutstandingHistory = require('../models/clientOutstandingHistory.model');
const InvoiceOverView = require('../models/invoiceOverview.model');
const Payment = require('../models/payment.model');

async function updateCustomerOutstanding(clientId) {
  try {
    const clientInvoices = await InvoiceOverView.find({ clientId });
    const clientPayments = await Payment.find({ clientId });

    if (clientInvoices.length === 0 || clientPayments.length === 0) {
      throw new Error('Error while summing total purchase or payment');
    }

    const invoiceTotal = clientInvoices.reduce((sum, invoice) => sum + invoice.grandTotalAmount, 0);
    const paymentTotal = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);

    let clientOutstanding = await ClientOutstanding.findById(clientId);

      if (clientOutstanding) {
      clientOutstanding.purchasedAmount = invoiceTotal;
      clientOutstanding.paymentAmount = paymentTotal;
      clientOutstanding.modifiedDate = new Date();
    } else {
      clientOutstanding = new ClientOutstanding({
        _id: clientId,
        purchasedAmount: invoiceTotal,
        paymentAmount: paymentTotal,
        modifiedDate: new Date()
      });
    }

    await clientOutstanding.save();
    await updateCustomerOutstandingHistory(clientOutstanding);
    return clientOutstanding;
  } catch (err) {
    throw new Error('Error while updating outstanding: ' + err.message);
  }
}

async function getClientOutstandingByClientId(clientId) {
  const clientOutstanding = await ClientOutstanding.findById(clientId);
  if (!clientOutstanding) {
    const error = new Error('Client Outstanding not found!');
    error.status = 404;
    throw error;
  }
  return clientOutstanding.purchasedAmount - clientOutstanding.paymentAmount;
}

async function updateCustomerOutstandingHistory(clientOutstanding) {
  const history = new ClientOutstandingHistory({
    _id: clientOutstanding.clientId,
    clientId: clientOutstanding.clientId,
    purchasedAmount: clientOutstanding.purchasedAmount,
    paymentAmount: clientOutstanding.paymentAmount,
    createdDate: new Date()
  });
  await history.save();
  return true;
}

module.exports = {
  updateCustomerOutstanding,
  getClientOutstandingByClientId
};
