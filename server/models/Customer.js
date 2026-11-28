const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "customer",
      enum: ["customer", "admin", "staff"],
    },

    status: {
      type: String,
      default: "active",
      enum: ["active", "suspended"],
    },

    availablePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    lifetimeEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);