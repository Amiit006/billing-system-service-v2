const Purchase = require('../purchase.model');
const PurchasePayment = require('./payment.model');

async function createPayment(seasonId, purchaseId, paymentData) {
  const purchase = await Purchase.findOne({
    _id: purchaseId,
    season: seasonId,
  }).populate('payments');

  if (!purchase) {
    const err = new Error('Purchase not found!');
    err.status = 404;
    throw err;
  }

  const totalPaid = (purchase.payments || []).reduce((acc, p) => acc + p.amount, 0);

  const finalPayableAmount =
    purchase.purchaseAmount +
    purchase.packingCharge +
    purchase.taxAmount -
    purchase.discountAmount -
    purchase.extraDiscountAmount;

  if (totalPaid + paymentData.amount > finalPayableAmount) {
    const err = new Error('unexpected amount');
    err.status = 400;
    throw err;
  }

  paymentData.purchase = purchaseId;
  paymentData.createdDate = new Date();
  paymentData.modifiedDate = new Date();

  const payment = new PurchasePayment(paymentData);
  await payment.save();
  await Purchase.findByIdAndUpdate(purchaseId, {
    $push: { payments: payment._id }
  });
  return payment;
}

module.exports = {
  createPayment,
};
