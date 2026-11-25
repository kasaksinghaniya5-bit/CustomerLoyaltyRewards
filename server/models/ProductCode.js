const mongoose = require("mongoose");

const productCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    points: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["unclaimed", "claimed", "deactivated"],
      default: "unclaimed",
    },

    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    claimedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProductCode", productCodeSchema);