const paymentService = require('./payment.service');

const generatePaymentId = async (req, res) => {
  try {
    const id = await paymentService.generatePaymentId();
    return res.status(200).json(id);
  } catch (error) {
    return res.status(500).json({ error: 'Error occurred' });
  }
};

const savePayment = async (req, res) => {
  try {
    const paymentForm = req.body;
    const newPayment = await paymentService.savePayment(paymentForm);
    return res.status(201).json({ response: 'Payment saved successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error occurred' });
  }
};

const getPaymentByClientId = async (req, res) => {
  try {
    const clientId = req.query.clientId;
    const result = await paymentService.getPaymentByClientId(clientId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: 'Error occurred' });
  }
};

module.exports = {
  generatePaymentId,
  savePayment,
  getPaymentByClientId,
};
