const Purchase = require('../purchase.model');
const Transport = require('../transport.model');
const PurchasePayment = require('../payment/payment.model');

async function getDashboardStats(seasonId) {
  const season = parseInt(seasonId);

  // 1️⃣ Fetch all purchases for the season
  const purchases = await Purchase.find({ seasonId: season }).lean();

  // Extract transportIds and purchaseIds
  const transportIds = purchases.map(p => p.transportId).filter(Boolean);
  const purchaseIds = purchases.map(p => p.purchaseId);

  // 2️⃣ Fetch all relevant transports
  const transports = await Transport.find({ transportId: { $in: transportIds } }).lean();
  const transportMap = new Map(transports.map(t => [t.transportId, t]));

  // 3️⃣ Fetch all relevant payments
  const payments = await PurchasePayment.find({ purchaseId: { $in: purchaseIds } }).lean();
  const paymentMap = new Map(); // purchaseId => [payments]

  for (const pay of payments) {
    if (!paymentMap.has(pay.purchaseId)) {
      paymentMap.set(pay.purchaseId, []);
    }
    paymentMap.get(pay.purchaseId).push(pay);
  }

  // 4️⃣ Calculate totals
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

    const transport = transportMap.get(p.transportId);
    if (transport?.amount) {
      totalTransportCharges += transport.amount || 0;
    }

    const paymentsForPurchase = paymentMap.get(p.purchaseId) || [];
    for (const pay of paymentsForPurchase) {
      totalPaymentAmount += pay.amount || 0;
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
