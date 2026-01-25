const Purchase = require('../purchase.model');
const PurchasePayment = require('./payment.model');

/**
 * Create a new payment for a purchase.
 * Validates against overpayment and ensures purchase exists for given season and purchaseId.
 */
async function createPayment(seasonId, purchaseId, paymentData) {
  const purchase = await Purchase.findOne({ purchaseId, seasonId }).lean();
  if (!purchase) throw Object.assign(new Error('Purchase not found!'), { status: 404 });

  const payments = await PurchasePayment.find({ purchaseId: purchase.purchaseId }).select('amount');

  const totalPaid = (payments || []).reduce((acc, p) => acc + p.amount, 0);

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
    purchaseId: purchase.purchaseId,
    createdDate: new Date(),
    modifiedDate: new Date(),
  });

  await payment.save();

  // Add payment reference to Purchase
  // await Purchase.updateOne(
  //   { purchaseId: purchaseId },
  //   { $push: { payments: payment._id } }
  // );

  return payment;
}

module.exports = {
  createPayment,
};
