const mongoose = require("mongoose");

const pointsTransactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    type: {
      type: String,
      enum: ["earned", "redeemed", "refunded", "adjustment"],
      required: true,
    },

    points: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      default: null,
      trim: true,
    },

    referenceId: {
      type: String,
      default: null,
      trim: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PointsTransaction",
  pointsTransactionSchema
);