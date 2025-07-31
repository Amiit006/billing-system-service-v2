const mongoose = require("mongoose");

const invoiceOverviewSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: Number,
      required: true,
      unique: true, // mirrors AUTO_INCREMENT primary key
    },
    clientId: {
      type: Number,
    },
    paymentId: {
      type: Number, // Assuming Payment is also tracked by numeric `paymentId`
      // If referencing Mongo ObjectId from `Payment`, change this to:
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'Payment',
    },
    invoiceDate: {
      type: Date,
    },
    subTotalAmount: {
      type: Number,
    },
    taxPercentage: {
      type: Number,
    },
    taxAmount: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
    },
    discountAmount: {
      type: Number,
    },
    grandTotalAmount: {
      type: Number,
    },
    remarks: {
      type: String,
      maxlength: 200,
    },
    createdDate: {
      type: Date,
    },
    modifiedDate: {
      type: Date,
    },
  },
  {
    collection: "invoiceoverview",
  }
);

module.exports = mongoose.model("InvoiceOverview", invoiceOverviewSchema);
