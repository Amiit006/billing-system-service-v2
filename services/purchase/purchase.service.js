// services/purchase/purchase.service.js
const mongoose = require('mongoose');
const Purchase = require("./purchase.model");
const Season = require("./season/season.model");
const Transport = require("./transport.model");
const PurchasePayment = require("./payment/payment.model");

// Get all purchases with full details
const getAllPurchases = async () => {
  const purchases = await Purchase.find().lean().sort({ createdDate: -1 });
  const seasons = await Season.find().lean();
  const transports = await Transport.find().lean();
  const payments = await PurchasePayment.find().lean();

  const seasonMap = Object.fromEntries(seasons.map((s) => [s.seasonId, s]));
  const transportMap = Object.fromEntries(
    transports.map((t) => [t.transportId, t])
  );

  const paymentsByPurchaseId = {};
  for (const pay of payments) {
    if (!paymentsByPurchaseId[pay.purchaseId])
      paymentsByPurchaseId[pay.purchaseId] = [];
    paymentsByPurchaseId[pay.purchaseId].push(pay);
  }

  return purchases.map((p) => ({
    ...p,
    season: seasonMap[p.seasonId] || null,
    transport: transportMap[p.transportId] || null,
    payments: paymentsByPurchaseId[p.purchaseId] || [],
  }));
};

// Get all purchases for a given season
const getPurchasesBySeason = async (seasonId) => {
  const purchases = await Purchase.find({ seasonId: parseInt(seasonId) })
    .lean()
    .sort({ createdDate: -1 });
  const transports = await Transport.find().lean();
  const payments = await PurchasePayment.find().lean();

  const transportMap = Object.fromEntries(
    transports.map((t) => [t.transportId, t])
  );

  const paymentsByPurchaseId = {};
  for (const pay of payments) {
    if (!paymentsByPurchaseId[pay.purchaseId])
      paymentsByPurchaseId[pay.purchaseId] = [];
    paymentsByPurchaseId[pay.purchaseId].push(pay);
  }

  return purchases.map((p) => ({
    ...p,
    transport: transportMap[p.transportId] || null,
    payments: paymentsByPurchaseId[p.purchaseId] || [],
  }));
};

// Create a new purchase
const createPurchase = async (seasonId, purchaseData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    // 1. Find season
    const season = await Season.findOne({
      seasonId: parseInt(seasonId),
    }).session(session);
    
    if (!season) throw { status: 404, message: "Season not found" };

    // 2. Save transport
    let transportId = null;
    if (purchaseData.transport) {
      const lastTransport = await Transport.findOne()
        .sort({ transportId: -1 })
        .lean()
        .session(session);
      const nextTransportId = lastTransport ? lastTransport.transportId + 1 : 1;

      const transport = new Transport({
        transportId: nextTransportId,
        transportName: purchaseData.transport.transportName,
        amount: purchaseData.transport.amount,
        consignmentNumber: purchaseData.transport.consignmentNumber,
        createdDate: now,
        modifiedDate: now,
      });

      const savedTransport = await transport.save({ session });
      transportId = savedTransport.transportId;
    }

    // 3. Save purchase
    const lastPurchase = await Purchase.findOne()
      .sort({ purchaseId: -1 })
      .lean()
      .session(session);
    const nextPurchaseId = lastPurchase ? lastPurchase.purchaseId + 1 : 1;

    const purchase = new Purchase({
      purchaseId: nextPurchaseId,
      partyName: purchaseData.partyName,
      purchaseDate: purchaseData.purchaseDate,
      purchaseAmount: purchaseData.purchaseAmount,
      packingCharge: purchaseData.packingCharge,
      taxPercent: purchaseData.taxPercent,
      taxAmount: purchaseData.taxAmount,
      discountPercent: purchaseData.discountPercent,
      discountAmount: purchaseData.discountAmount,
      extraDiscountAmount: purchaseData.extraDiscountAmount,
      seasonId: season.seasonId,
      transportId: transportId,
      createdDate: now,
      modifiedDate: now,
    });

    const savedPurchase = await purchase.save({ session });

    // 4. Save payments
    if (Array.isArray(purchaseData.payments)) {
      const lastPayment = await PurchasePayment.findOne()
        .sort({ paymentId: -1 })
        .lean()
        .session(session);
      let nextPaymentId = lastPayment ? lastPayment.paymentId + 1 : 1;

      const payments = purchaseData.payments.map((payment) => ({
        paymentId: nextPaymentId++,
        mode: payment.mode,
        chequeNo: payment.chequeNo,
        paymentDate: payment.paymentDate,
        remark: payment.remark,
        amount: payment.amount,
        purchaseId: savedPurchase.purchaseId,
        createdDate: now,
        modifiedDate: now,
      }));

      await PurchasePayment.insertMany(payments, { session });
    }

    // 5. Commit transaction
    await session.commitTransaction();
    session.endSession();

    return savedPurchase;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// Delete a purchase by purchaseId
const deletePurchase = async (purchaseId) => {
  const purchase = await Purchase.findOne({ purchaseId: parseInt(purchaseId) });
  if (!purchase) throw { status: 404, message: "Purchase not found" };

  await Purchase.deleteOne({ purchaseId: parseInt(purchaseId) });
  return true;
};

module.exports = {
  getAllPurchases,
  getPurchasesBySeason,
  createPurchase,
  deletePurchase,
};
