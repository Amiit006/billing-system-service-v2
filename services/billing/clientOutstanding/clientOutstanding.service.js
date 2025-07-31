const ClientOutstanding = require('./clientOutstanding.model');
const ClientOutstandingHistory = require('./clientOutstandingHistory.model');
const InvoiceOverView = require('../invoice/invoiceOverview.model');
const Payment = require('../payment/payment.model');

async function updateCustomerOutstanding(clientId) {
  try {
    const [clientInvoices, clientPayments] = await Promise.all([
      InvoiceOverView.find({ clientId }),
      Payment.find({ clientId })
    ]);

    if (clientInvoices.length === 0 && clientPayments.length === 0) {
      // If no invoices or payments exist, create a zero outstanding record
      const clientOutstanding = new ClientOutstanding({
        clientId: clientId,
        purchasedAmount: 0,
        paymentAmount: 0,
        modifiedDate: new Date()
      });
      await clientOutstanding.save();
      await updateCustomerOutstandingHistory(clientOutstanding);
      return clientOutstanding;
    }

    const invoiceTotal = clientInvoices.reduce((sum, invoice) => sum + (invoice.grandTotalAmount || 0), 0);
    const paymentTotal = clientPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    let clientOutstanding = await ClientOutstanding.findOne({ clientId });

    if (clientOutstanding) {
      clientOutstanding.purchasedAmount = invoiceTotal;
      clientOutstanding.paymentAmount = paymentTotal;
      clientOutstanding.modifiedDate = new Date();
    } else {
      clientOutstanding = new ClientOutstanding({
        clientId: clientId,
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
  const clientOutstanding = await ClientOutstanding.findOne({ clientId });
  if (!clientOutstanding) {
    const error = new Error('Client Outstanding not found!');
    error.status = 404;
    throw error;
  }
  return clientOutstanding.purchasedAmount - clientOutstanding.paymentAmount;
}

async function updateCustomerOutstandingHistory(clientOutstanding) {
  const history = new ClientOutstandingHistory({
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