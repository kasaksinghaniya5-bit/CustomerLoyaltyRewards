
const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },

    rewardName: {
      type: String,
      required: true,
      trim: true,
    },

    pointsSpent: {
      type: Number,
      required: true,
      min: 1,
    },

    redemptionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    collectedAt: {
      type: Date,
      default: null,
    },

    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Redemption", redemptionSchema);
