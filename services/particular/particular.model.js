const mongoose = require("mongoose");

const particularSchema = new mongoose.Schema(
  {
    particularId: {
      type: Number,
      required: true,
      unique: true, // Mirrors AUTO_INCREMENT
    },
    particularName: {
      type: String,
      required: true,
      unique: true, // Matches UNIQUE KEY
      maxlength: 45,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "particulars",
  }
);

module.exports = mongoose.model("Particular", particularSchema);
