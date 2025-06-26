const Payment = require('../models/payment.model'); // Sequelize or Mongoose model
const clientService = require('../../client/client.service'); // client validation
const clientOutstandingService = require('../clientOutstanding/clientOutstanding.service');
// const { InvoiceException } = require('../exception/invoice.exception');

const generatePaymentId = async () => {
  const latestPayment = await Payment.findOne().sort({ paymentId: -1 }).limit(1);
  if (latestPayment) return latestPayment.paymentId + 1;
  return 1;
};

const savePayment = async (paymentForm) => {
  const paymentDto = paymentForm.payment;
  const clientDto = paymentForm.client;

  const isClientPresent = await clientService.isClientPresent(clientDto);
  if (!isClientPresent) {
    // throw new InvoiceException('Client not found!', 404);
  }

  const now = new Date();

  const payment = new Payment({
    paymentId: paymentDto.paymentId,
    amount: paymentDto.paymentAmount,
    paymentDate: new Date(paymentDto.paymentDate),
    paymentMode: paymentDto.paymentMode,
    clientId: clientDto.clientId,
    createdDate: now,
    modifiedDate: now,
  });

  const savedPayment = await payment.save();
  await clientOutstandingService.updateCustomerOutstanding(clientDto.clientId);

  return savedPayment;
};

const getPaymentByClientId = async (clientId) => {
  await clientService.isClientPresentByClientId(clientId);
  const payments = await Payment.find({ clientId });
  return payments.filter((p) => parseFloat(p.amount) !== 0.0);
};

module.exports = {
  generatePaymentId,
  savePayment,
  getPaymentByClientId,
};
