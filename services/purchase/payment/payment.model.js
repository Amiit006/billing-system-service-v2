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

module.exports = mongoose.model("PurchasePayment", paymentSchema, "purchasepayment");
