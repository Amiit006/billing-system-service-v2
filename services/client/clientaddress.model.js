const mongoose = require("mongoose");

const clientAddressSchema = new mongoose.Schema(
  {
    addressId: {
      type: Number,
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zip: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ClientAddress", clientAddressSchema, "clientaddress");
