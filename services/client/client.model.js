// client.model.js
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: Number,
      required: true,
      unique: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      maxlength: 10,
    },
    email: String,
    gstNumber: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    addressId: {
      type: Number,
      ref: "ClientAddress", // Refers to the addressId field in ClientAddress
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Client", clientSchema, "client");
