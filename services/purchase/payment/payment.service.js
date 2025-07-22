const Purchase = require('../purchase.model');
const PurchasePayment = require('./payment.model');

/**
 * Create a new payment for a purchase.
 * Validates against overpayment and ensures purchase exists for given season and purchaseId.
 */
async function createPayment(seasonId, purchaseId, paymentData) {
  const purchase = await Purchase.findOne({
    purchaseId: purchaseId,
    season: seasonId,
  }).populate('payments');

  if (!purchase) {
    const err = new Error('Purchase not found!');
    err.status = 404;
    throw err;
  }

  const totalPaid = (purchase.payments || []).reduce((acc, p) => acc + p.amount, 0);

  const finalPayableAmount =
    (purchase.purchaseAmount || 0) +
    (purchase.packingCharge || 0) +
    (purchase.taxAmount || 0) -
    (purchase.discountAmount || 0) -
    (purchase.extraDiscountAmount || 0);

  if (totalPaid + paymentData.amount > finalPayableAmount) {
    const err = new Error('Unexpected amount: payment exceeds final payable amount');
    err.status = 400;
    throw err;
  }

  // Save the new payment
  const payment = new PurchasePayment({
    ...paymentData,
    createdDate: new Date(),
    modifiedDate: new Date(),
  });

  await payment.save();

  // Add payment reference to Purchase
  await Purchase.updateOne(
    { purchaseId: purchaseId },
    { $push: { payments: payment._id } }
  );

  return payment;
}

module.exports = {
  createPayment,
};
