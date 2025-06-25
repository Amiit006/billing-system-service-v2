const paymentService = require("./payment.service");

// POST /payment/create?seasonId=1&purchaseId=123
const createPayment = async (req, res) => {
  try {
    const { seasonId, purchaseId } = req.query;
    const payment = await paymentService.createPayment(
      seasonId,
      purchaseId,
      req.body
    );
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = {
  createPayment,
};
