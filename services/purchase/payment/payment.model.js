const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: { type: Number, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  mode: { type: String, required: true },
  chequeNo: { type: String },
  remark: { type: String },
  purchaseId: { type: Number, required: true, ref: "Purchase" },
  createdDate: Date,
  modifiedDate: Date,
});

// counter schema for sequence generation
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema, "counters");

// helper to get next sequence value
// If the counter document exists -> atomically increment and return the next seq.
// If the counter document does not exist (e.g. counter collection was dropped),
// initialize the counter from the current maximum paymentId in the payments collection
// so we don't accidentally reuse low IDs.
async function getNextSequence(name) {
  // Try to increment an existing counter (do NOT upsert here so we can detect absence).
  const updated = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: false }
  ).exec();

  if (updated) {
    return updated.seq;
  }

  // No counter document existed. Compute the current maximum paymentId from the
  // PurchasePayment collection and initialize the counter to (max + 1).
  // Use the registered model — by the time the hook runs the model will be registered.
  const PurchasePaymentModel =
    mongoose.models.PurchasePayment || mongoose.model('PurchasePayment');

  const maxDoc = await PurchasePaymentModel.findOne()
    .sort({ paymentId: -1 })
    .select('paymentId')
    .lean()
    .exec();

  const start = (maxDoc && typeof maxDoc.paymentId === 'number') ? maxDoc.paymentId : 0;

  // Initialize counter to start+1 (the next id to use). Use upsert to create the counter doc.
  const doc = await Counter.findOneAndUpdate(
    { _id: name },
    { $set: { seq: start + 1 } },
    { new: true, upsert: true }
  ).exec();

  return doc.seq;
}

// pre-validate hook to auto-generate numeric paymentId before validation
// Use pre('validate') so the auto-generated paymentId exists when Mongoose runs
// required-field validation for `paymentId`.
paymentSchema.pre("validate", async function (next) {
  if (this.isNew && (this.paymentId == null)) {
    try {
      this.paymentId = await getNextSequence("purchasepayment");
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("PurchasePayment", paymentSchema, "purchasepayment");