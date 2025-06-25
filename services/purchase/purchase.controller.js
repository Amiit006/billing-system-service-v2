const purchaseService = require('./purchase.service');

// POST /purchase/create
const createPurchase = async (req, res) => {
  const { seasonId } = req.query;
  const purchase = req.body;

  try {
    const result = await purchaseService.createPurchase(seasonId, purchase);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  }
};

// GET /purchase?seasonId=1
const getPurchasesBySeason = async (req, res) => {
  const { seasonId } = req.query;

  try {
    const result = await purchaseService.getPurchasesBySeason(seasonId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /purchase/purchases
const getAllPurchases = async (req, res) => {
  try {
    const result = await purchaseService.getAllPurchases();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /purchase?purchaseId=123
const deletePurchase = async (req, res) => {
  const { purchaseId } = req.query;

  try {
    const result = await purchaseService.deletePurchase(purchaseId);
    res.status(200).json({ success: result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = {
  createPurchase,
  getPurchasesBySeason,
  getAllPurchases,
  deletePurchase,
};
