const purchaseModel = require('../purchase.model');

async function getDashboardStats(seasonId) {
  const purchases = await purchaseModel.find({ 'season.seasonId': parseInt(seasonId) });

  let totalBasePurchaseAmount = 0;
  let totalTaxAmount = 0;
  let totalPackingCharge = 0;
  let totalDiscAmount = 0;
  let totalExtraDiscAmount = 0;
  let totalTransportCharges = 0;
  let totalPaymentAmount = 0;

  for (const p of purchases) {
    totalBasePurchaseAmount += p.purchaseAmount || 0;
    totalTaxAmount += p.taxAmount || 0;
    totalPackingCharge += p.packingCharge || 0;
    totalDiscAmount += p.discountAmount || 0;
    totalExtraDiscAmount += p.extraDiscountAmount || 0;

    if (p.transport && p.transport.amount) {
      totalTransportCharges += p.transport.amount || 0;
    }

    if (Array.isArray(p.payments)) {
      for (const pay of p.payments) {
        totalPaymentAmount += pay.amount || 0;
      }
    }
  }

  const totalAbsolutePurchaseAmount = totalBasePurchaseAmount + totalTaxAmount + totalPackingCharge;
  const totalDiscountAmount = totalDiscAmount + totalExtraDiscAmount;
  const totalPurchaseAfterDisc = totalAbsolutePurchaseAmount - totalDiscountAmount;

  return [
    { name: 'Purchase + Transport', value: totalAbsolutePurchaseAmount + totalTransportCharges },
    { name: 'Total Purchase Amount', value: totalAbsolutePurchaseAmount },
    { name: 'Total Disc. Amount', value: totalDiscountAmount },
    { name: 'Total Purchase Amount (After Disc)', value: totalPurchaseAfterDisc },
    { name: 'Total Payment Amount', value: totalPaymentAmount },
    { name: 'Total Payment Pending', value: totalPurchaseAfterDisc - totalPaymentAmount },
    { name: 'Total Transport Charges', value: totalTransportCharges }
  ];
}

module.exports = { getDashboardStats };
