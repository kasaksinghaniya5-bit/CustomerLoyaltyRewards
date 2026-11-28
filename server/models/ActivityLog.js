
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "customer_registered",
        "code_claimed",
        "points_earned",
        "reward_redeemed",
        "reward_collected",
        "customer_suspended",
        "customer_reactivated",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedModel: {
      type: String,
      enum: ["ProductCode", "Reward", "Redemption"],
      default: null,
    },

    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
