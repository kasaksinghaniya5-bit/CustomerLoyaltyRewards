const express = require("express");
const Customer = require("../models/Customer");
const protect = require("../middleware/authMiddleware");
const ProductCode = require("../models/ProductCode");
const PointsTransaction = require("../models/PointsTransaction");
const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Notification = require("../models/Notification");

const router = express.Router();

// Get logged-in customer's profile
router.get("/profile", protect, async (req, res) => {
  try {
    // Only customers can access this route
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Access denied. Customer access only.",
      });
    }

    const customer = await Customer.findById(req.user.id).select("-password");

    if (!customer) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    res.status(200).json({
      customer,
    });
  } catch (error) {
    console.error("Profile fetch error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve customer profile.",
    });
  }
});

// Claim a product code
router.post("/claim-code", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Access denied. Customer access only.",
      });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Product code is required.",
      });
    }

    const cleanCode = code.trim().toUpperCase();

    const productCode = await ProductCode.findOne({
      code: cleanCode,
    });

    if (!productCode) {
      return res.status(404).json({
        message: "Invalid product code.",
      });
    }

    if (productCode.status !== "unclaimed") {
      return res.status(409).json({
        message: "This product code has already been used or deactivated.",
      });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    const newBalance = customer.availablePoints + productCode.points;

    customer.availablePoints = newBalance;
    customer.lifetimeEarned += productCode.points;

    productCode.status = "claimed";
    productCode.claimedBy = customer._id;
    productCode.claimedAt = new Date();

    await customer.save();
    await productCode.save();

    await PointsTransaction.create({
      customer: customer._id,
      type: "earned",
      points: productCode.points,
      description: "Product code claimed",
      productName: productCode.productName,
      referenceId: productCode.code,
      balanceAfter: newBalance,
    });

    res.status(200).json({
      message: `Congratulations! You earned ${productCode.points} points.`,
      pointsEarned: productCode.points,
      availablePoints: customer.availablePoints,
      lifetimeEarned: customer.lifetimeEarned,
      productName: productCode.productName,
    });
  } catch (error) {
    console.error("Code claim error:", error.message);

    res.status(500).json({
      message: "Something went wrong while claiming the code.",
    });
  }
});

// Get customer's points transactions

router.get("/transactions", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Access denied. Customer access only.",
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const filter = {
      customer: req.user.id,
    };

    const [transactions, totalTransactions] = await Promise.all([
      PointsTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      PointsTransaction.countDocuments(filter),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions,
        limit,
      },
    });
  } catch (error) {
    console.error("Transaction fetch error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve transaction history.",
    });
  }
});


// Get available rewards
router.get("/rewards", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Access denied. Customer access only.",
      });
    }

    const rewards = await Reward.find({
      status: "active",
      stock: { $gt: 0 },
    })
      .select("-__v")
      .sort({ pointsCost: 1 });

    res.status(200).json({
      rewards,
    });
  } catch (error) {
    console.error("Rewards fetch error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve available rewards.",
    });
  }
});

// Redeem a reward using customer points
router.post("/redeem", protect, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only.",
      });
    }

    const { rewardId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
      return res.status(400).json({
        message: "Invalid reward selection.",
      });
    }

    let redemptionResult = null;

    await session.withTransaction(async () => {
      const customer = await Customer.findById(req.user.id).session(session);

      if (!customer || customer.status !== "active") {
        throw new Error("Customer account is unavailable.");
      }

      if (customer.availablePoints < 100) {
        throw new Error("You need at least 100 points before redeeming a reward.");
      }

      const reward = await Reward.findOne({
        _id: rewardId,
        status: "active",
        stock: { $gt: 0 },
      }).session(session);

      if (!reward) {
        throw new Error("This reward is currently unavailable.");
      }

      if (customer.availablePoints < reward.pointsCost) {
        throw new Error("You do not have enough points for this reward.");
      }

      const updatedReward = await Reward.findOneAndUpdate(
        {
          _id: reward._id,
          status: "active",
          stock: { $gt: 0 },
        },
        {
          $inc: { stock: -1 },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedReward) {
        throw new Error("This reward is out of stock.");
      }

      const updatedCustomer = await Customer.findOneAndUpdate(
        {
          _id: customer._id,
          status: "active",
          availablePoints: { $gte: reward.pointsCost },
        },
        {
          $inc: {
            availablePoints: -reward.pointsCost,
            totalRedeemed: reward.pointsCost,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedCustomer) {
        throw new Error("Insufficient points. Please try again.");
      }

      const redemptionCode =
        "RDM-" + crypto.randomBytes(6).toString("hex").toUpperCase();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const redemption = await Redemption.create(
        [
          {
            customer: customer._id,
            reward: reward._id,
            rewardName: reward.name,
            pointsSpent: reward.pointsCost,
            redemptionCode,
            expiresAt,
          },
        ],
        { session }
      );

      await PointsTransaction.create(
        [
          {
            customer: customer._id,
            type: "redeemed",
            points: reward.pointsCost,
            description: `Redeemed ${reward.name}`,
            productName: reward.name,
            referenceId: redemptionCode,
            balanceAfter: updatedCustomer.availablePoints,
          },
        ],
        { session }
      );

      await Notification.create(
  [
    {
      customer: customer._id,
      type: "redemption",
      title: "Reward redeemed successfully",
      message: `You redeemed ${reward.name} for ${reward.pointsCost.toLocaleString(
        "en-IN"
      )} points. Your collection code is ${redemptionCode}.`,
      read: false,
    },
  ],
  { session }
);

      redemptionResult = {
        rewardName: reward.name,
        redemptionCode,
        pointsSpent: reward.pointsCost,
        availablePoints: updatedCustomer.availablePoints,
        expiresAt,
      };
    });

    return res.status(201).json({
      message: "Reward redeemed successfully!",
      redemption: redemptionResult,
    });
  } catch (error) {
    console.error("Reward redemption error:", error.message);

    return res.status(400).json({
      message: error.message || "Unable to redeem this reward.",
    });
  } finally {
    await session.endSession();
  }
});

// Get customer's redemption history
router.get("/redemptions", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only.",
      });
    }

    const redemptions = await Redemption.find({
      customer: req.user.id,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      redemptions,
    });
  } catch (error) {
    console.error("Redemption history error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve redemption history.",
    });
  }
});

// Cancel an active redemption and refund points
router.post("/redemptions/:redemptionId/cancel", protect, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only.",
      });
    }

    const { redemptionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(redemptionId)) {
      return res.status(400).json({
        message: "Invalid redemption.",
      });
    }

    let cancellationResult = null;

    await session.withTransaction(async () => {
      const redemption = await Redemption.findOne({
        _id: redemptionId,
        customer: req.user.id,
      }).session(session);

      if (!redemption) {
        throw new Error("Redemption not found.");
      }

      if (redemption.status !== "active") {
        throw new Error(
          "Only active redemptions can be cancelled."
        );
      }

      const customer = await Customer.findById(req.user.id).session(session);

      if (!customer || customer.status !== "active") {
        throw new Error("Customer account is unavailable.");
      }

      const reward = await Reward.findById(redemption.reward).session(session);

      if (!reward) {
        throw new Error("The associated reward could not be found.");
      }

      const updatedCustomer = await Customer.findOneAndUpdate(
        {
          _id: customer._id,
          status: "active",
        },
        {
          $inc: {
            availablePoints: redemption.pointsSpent,
            totalRedeemed: -redemption.pointsSpent,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedCustomer) {
        throw new Error("Unable to refund your points.");
      }

      await Reward.findOneAndUpdate(
        {
          _id: reward._id,
        },
        {
          $inc: {
            stock: 1,
          },
        },
        {
          new: true,
          session,
        }
      );

      redemption.status = "cancelled";
      await redemption.save({ session });

      await PointsTransaction.create(
        [
          {
            customer: customer._id,
            type: "refunded",
            points: redemption.pointsSpent,
            description: `Refund for cancelled ${redemption.rewardName}`,
            productName: redemption.rewardName,
            referenceId: redemption.redemptionCode,
            balanceAfter: updatedCustomer.availablePoints,
          },
        ],
        { session }
      );

      await Notification.create(
  [
    {
      customer: customer._id,
      type: "cancellation",
      title: "Redemption cancelled",
      message: `${redemption.rewardName} was cancelled and ${redemption.pointsSpent.toLocaleString(
        "en-IN"
      )} points were refunded to your account.`,
      read: false,
    },
  ],
  { session }
);

      cancellationResult = {
        redemptionId: redemption._id,
        rewardName: redemption.rewardName,
        pointsRefunded: redemption.pointsSpent,
        availablePoints: updatedCustomer.availablePoints,
        status: redemption.status,
      };
    });

    return res.status(200).json({
      message: "Redemption cancelled and points refunded successfully!",
      redemption: cancellationResult,
    });
  } catch (error) {
    console.error("Redemption cancellation error:", error.message);

    return res.status(400).json({
      message:
        error.message || "Unable to cancel this redemption.",
    });
  } finally {
    await session.endSession();
  }
});

// Get customer's notifications
router.get("/notifications", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only.",
      });
    }

    const notifications = await Notification.find({
      customer: req.user.id,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error("Notification history error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve notifications.",
    });
  }
});

// Mark a notification as read
router.patch("/notifications/:notificationId/read", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only.",
      });
    }

    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        message: "Invalid notification.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        customer: req.user.id,
      },
      {
        read: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark notification error:", error.message);

    res.status(500).json({
      message: "Unable to update notification.",
    });
  }
});

// Get customer leaderboard
router.get("/leaderboard", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only.",
      });
    }

    const topCustomers = await Customer.find({
      role: "customer",
      status: "active",
    })
      .select("username availablePoints")
      .sort({ availablePoints: -1, createdAt: 1, _id: 1 })
      .limit(10)
      .lean();

    const currentCustomer = await Customer.findOne({
      _id: req.user.id,
      role: "customer",
      status: "active",
    })
      .select("username availablePoints")
      .lean();

    if (!currentCustomer) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    const customersAhead = await Customer.countDocuments({
      role: "customer",
      status: "active",
      availablePoints: {
        $gt: currentCustomer.availablePoints,
      },
    });

    const currentRank = customersAhead + 1;

    res.status(200).json({
      leaderboard: topCustomers.map((customer, index) => ({
        rank: index + 1,
        username: customer.username,
        availablePoints: customer.availablePoints,
      })),

      currentCustomer: {
        username: currentCustomer.username,
        availablePoints: currentCustomer.availablePoints,
        rank: currentRank,
      },
    });
  } catch (error) {
    console.error("Leaderboard error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve leaderboard.",
    });
  }
});

module.exports = router;