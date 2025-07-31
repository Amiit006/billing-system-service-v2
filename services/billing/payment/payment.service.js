const Payment = require('./payment.model');
const clientService = require('../../client/client.service');
const clientOutstandingService = require('../clientOutstanding/clientOutstanding.service');

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
    const error = new Error('Client not found!');
    error.status = 404;
    throw error;
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