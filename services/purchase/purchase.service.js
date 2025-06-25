const Purchase = require('./purchase.model');
const Season = require('./season/season.model');

exports.getAllPurchases = async () => {
  return await Purchase.find()
    .populate('season')
    .populate('transport')
    .populate('payments')
    .sort({ createdDate: -1 });
};

exports.getPurchasesBySeason = async (seasonId) => {
  return await Purchase.find({ season: seasonId })
    .populate('season')
    .populate('transport')
    .populate('payments')
    .sort({ createdDate: -1 });
};

exports.createPurchase = async (seasonId, purchaseData) => {
  const season = await Season.findById(seasonId);
  if (!season) {
    const error = new Error('Season not found');
    error.status = 404;
    throw error;
  }

  const now = new Date();

  const newPurchase = new Purchase({
    ...purchaseData,
    season: season._id,
    createdDate: now,
    modifiedDate: now,
  });

  return await newPurchase.save();
};

exports.deletePurchase = async (purchaseId) => {
  const purchase = await Purchase.findById(purchaseId);
  if (!purchase) {
    const error = new Error('Purchase not found');
    error.status = 404;
    throw error;
  }

  await Purchase.findByIdAndDelete(purchaseId);
  return true;
};
