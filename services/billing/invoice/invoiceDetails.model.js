const mongoose = require("mongoose");

const invoiceDetailsSchema = new mongoose.Schema(
  {
    invoiceDetailsId: {
      type: Number,
      required: true,
      unique: true,
    },
    slNo: {
      type: Number,
    },
    perticulars: {
      type: String,
      maxlength: 50,
    },
    amount: {
      type: Number,
    },
    quanity: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
    },
    total: {
      type: Number,
    },
    discountTotal: {
      type: Number,
    },
    quantityType: {
      type: String,
      maxlength: 2,
    },
    verified: {
      type: Boolean,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId, // assuming relation to invoiceOverview's _id
      ref: "InvoiceOverview",
    },
    createdDate: {
      type: Date,
    },
    modifiedDate: {
      type: Date,
    },
  },
  {
    collection: "invoicedetails", // ensure correct collection name
  }
);

module.exports = mongoose.model("InvoiceDetails", invoiceDetailsSchema);
