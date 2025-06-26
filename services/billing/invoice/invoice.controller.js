const invoiceService = require('./invoice.service');

// GET /invoice/generateInvoiceId
const generateInvoiceId = async (req, res) => {
  try {
    const invoiceId = await invoiceService.generateInvoiceId();
    res.status(200).json(invoiceId);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Invoice ID' });
  }
};

// GET /invoice/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const result = await invoiceService.getInvoiceById(invoiceId);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// GET /invoice/client?clientId=123
const getInvoiceByClientId = async (req, res) => {
  try {
    const clientId = req.query.clientId;
    const result = await invoiceService.getInvoiceByClientId(clientId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /invoice/createBill
const createBill = async (req, res) => {
  try {
    await invoiceService.createBill(req.body);
    res.status(201).json({ response: 'Invoice saved successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// PUT /invoice/updateBill/:id
const updateBill = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    await invoiceService.updateBill(invoiceId, req.body);
    res.status(201).json({ response: 'Invoice saved successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// PUT /invoice/addDiscount/:clientId/:invoiceId?remarks=xxx
const addDiscountToBill = async (req, res) => {
  try {
    const { clientId, invoiceId } = req.params;
    const { remarks } = req.query;
    const billAmountDetails = req.body;
    await invoiceService.addDiscountToBill(invoiceId, clientId, billAmountDetails, remarks);
    res.status(201).json({ response: 'Invoice saved successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = {
  generateInvoiceId,
  getInvoiceById,
  getInvoiceByClientId,
  createBill,
  updateBill,
  addDiscountToBill,
};
