const express = require("express");

const Customer = require("../models/Customer");
const ProductCode = require("../models/ProductCode");
const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const PointsTransaction = require("../models/PointsTransaction");
const protect = require("../middleware/authMiddleware");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

// Get admin dashboard statistics
router.get("/dashboard", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const [
      totalCustomers,
      totalProductCodes,
      activeRewards,
      pendingRedemptions,
      pointsIssuedResult,
      pointsRedeemedResult,
    ] = await Promise.all([
      Customer.countDocuments({
        role: "customer",
      }),

      ProductCode.countDocuments(),

      Reward.countDocuments({
        status: "active",
      }),

      Redemption.countDocuments({
        status: "active",
      }),

      PointsTransaction.aggregate([
        {
          $match: {
            type: "earned",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$points" },
          },
        },
      ]),

      PointsTransaction.aggregate([
        {
          $match: {
            type: "redeemed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$points" },
          },
        },
      ]),
    ]);

    const pointsIssued = pointsIssuedResult[0]?.total || 0;
    const pointsRedeemed = pointsRedeemedResult[0]?.total || 0;

    res.status(200).json({
      stats: {
        totalCustomers,
        totalProductCodes,
        activeRewards,
        pendingRedemptions,
        pointsIssued,
        pointsRedeemed,
        availableRewards: activeRewards,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve admin dashboard statistics.",
    });
  }
});


// Get all customers
router.get("/customers", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const customers = await Customer.find({
      role: "customer",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      customers,
    });
  } catch (error) {
    console.error("Admin customers error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve customers.",
    });
  }
});


// Suspend or reactivate a customer account
router.patch("/customers/:customerId/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Invalid account status.",
      });
    }

    const customer = await Customer.findOne({
      _id: req.params.customerId,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    customer.status = status;
    await customer.save();

    // Record customer status activity
await ActivityLog.create({
  type:
    status === "suspended"
      ? "customer_suspended"
      : "customer_reactivated",
  description: `${customer.fullName}'s account was ${
  status === "suspended" ? "suspended" : "reactivated"
}.`,
  customer: customer._id,
  performedBy: req.user.id,
});

    res.status(200).json({
      message: `Customer account ${status} successfully.`,
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        username: customer.username,
        status: customer.status,
      },
    });
  } catch (error) {
    console.error("Customer status update error:", error.message);

    res.status(500).json({
      message: "Unable to update customer status.",
    });
  }
});


// Get all product codes
router.get("/product-codes", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const productCodes = await ProductCode.find()
      .populate("claimedBy", "fullName email username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      productCodes,
    });
  } catch (error) {
    console.error("Admin product codes error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve product codes.",
    });
  }
});


const generateProductCode = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 12; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return code.match(/.{1,4}/g).join("-");
};

// Generate multiple product codes
router.post("/product-codes/generate", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const { productName, points, quantity } = req.body;

    if (
      !productName ||
      typeof productName !== "string" ||
      !productName.trim()
    ) {
      return res.status(400).json({
        message: "Product name is required.",
      });
    }

    if (!Number.isInteger(points) || points < 1) {
      return res.status(400).json({
        message: "Points must be a positive whole number.",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      return res.status(400).json({
        message: "Quantity must be between 1 and 500.",
      });
    }

    const productCodes = Array.from(
      { length: quantity },
      () => ({
        code: generateProductCode(),
        productName: productName.trim(),
        points,
      })
    );

    const createdCodes = await ProductCode.insertMany(productCodes);

    res.status(201).json({
      message: `${createdCodes.length} product codes generated successfully.`,
      productCodes: createdCodes,
    });
  } catch (error) {
    console.error("Product code generation error:", error.message);

    res.status(500).json({
      message: "Unable to generate product codes.",
    });
  }
});


// Deactivate an unclaimed product code
router.patch("/product-codes/:codeId/deactivate", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const productCode = await ProductCode.findById(req.params.codeId);

    if (!productCode) {
      return res.status(404).json({
        message: "Product code not found.",
      });
    }

    if (productCode.status !== "unclaimed") {
      return res.status(400).json({
        message: "Only unclaimed product codes can be deactivated.",
      });
    }

    productCode.status = "deactivated";
    await productCode.save();

    res.status(200).json({
      message: "Product code deactivated successfully.",
      productCode,
    });
  } catch (error) {
    console.error("Product code deactivation error:", error.message);

    res.status(500).json({
      message: "Unable to deactivate product code.",
    });
  }
});


 // Get all rewards
router.get("/rewards", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const rewards = await Reward.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      rewards,
    });
  } catch (error) {
    console.error("Admin rewards error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve rewards.",
    });
  }
});


// Create a new reward
router.post("/rewards", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const {
      name,
      category,
      description,
      imageUrl,
      pointsCost,
      stock,
    } = req.body;

    if (
      !name?.trim() ||
      !category?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message: "Name, category and description are required.",
      });
    }

    if (!Number.isInteger(pointsCost) || pointsCost < 1) {
      return res.status(400).json({
        message: "Points cost must be a positive whole number.",
      });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: "Stock must be zero or a positive whole number.",
      });
    }

    const reward = await Reward.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      imageUrl: imageUrl?.trim() || "",
      pointsCost,
      stock,
    });

    res.status(201).json({
      message: "Reward created successfully.",
      reward,
    });
  } catch (error) {
    console.error("Reward creation error:", error.message);

    res.status(500).json({
      message: "Unable to create reward.",
    });
  }
});


// Update reward details
router.patch("/rewards/:rewardId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const {
      name,
      category,
      description,
      imageUrl,
      pointsCost,
      stock,
    } = req.body;

    const reward = await Reward.findById(req.params.rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found.",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Reward name cannot be empty.",
        });
      }
      reward.name = name.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          message: "Category cannot be empty.",
        });
      }
      reward.category = category.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          message: "Description cannot be empty.",
        });
      }
      reward.description = description.trim();
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string") {
        return res.status(400).json({
          message: "Image URL must be text.",
        });
      }
      reward.imageUrl = imageUrl.trim();
    }

    if (pointsCost !== undefined) {
      if (!Number.isInteger(pointsCost) || pointsCost < 1) {
        return res.status(400).json({
          message: "Points cost must be a positive whole number.",
        });
      }
      reward.pointsCost = pointsCost;
    }

    if (stock !== undefined) {
      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
          message: "Stock must be zero or a positive whole number.",
        });
      }
      reward.stock = stock;
    }

    await reward.save();

    res.status(200).json({
      message: "Reward updated successfully.",
      reward,
    });
  } catch (error) {
    console.error("Reward update error:", error.message);

    res.status(500).json({
      message: "Unable to update reward.",
    });
  }
});


// Update reward status
router.patch("/rewards/:rewardId/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid reward status.",
      });
    }

    const reward = await Reward.findById(req.params.rewardId);

    if (!reward) {
      return res.status(404).json({
        message: "Reward not found.",
      });
    }

    reward.status = status;
    await reward.save();

    res.status(200).json({
      message: `Reward ${status} successfully.`,
      reward,
    });
  } catch (error) {
    console.error("Reward status update error:", error.message);

    res.status(500).json({
      message: "Unable to update reward status.",
    });
  }
});


// Get all redemption requests
router.get("/redemptions", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const redemptions = await Redemption.find()
      .populate("customer", "fullName email username")
      .populate("reward", "name category imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      redemptions,
    });
  } catch (error) {
    console.error("Admin redemptions error:", error.message);

    res.status(500).json({
      message: "Unable to retrieve redemption requests.",
    });
  }
});


// Mark a redemption as collected
router.patch("/redemptions/:redemptionId/collect", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({
        message: "Access denied. Admin or staff access only.",
      });
    }

    const redemption = await Redemption.findById(
      req.params.redemptionId
    );

    if (!redemption) {
      return res.status(404).json({
        message: "Redemption not found.",
      });
    }

    if (redemption.status !== "active") {
      return res.status(400).json({
        message: "Only active redemptions can be marked as collected.",
      });
    }

    if (redemption.expiresAt < new Date()) {
      return res.status(400).json({
        message: "This redemption has expired.",
      });
    }

    redemption.status = "used";
    redemption.collectedAt = new Date();
    redemption.collectedBy = req.user.id;

    await redemption.save();

    // Record reward collection activity
await ActivityLog.create({
  type: "reward_collected",
  description: `${redemption.rewardName} was marked as collected.`,
  customer: redemption.customer,
  performedBy: req.user.id,
  relatedId: redemption._id,
  relatedModel: "Redemption",
  points: redemption.pointsSpent,
});

    res.status(200).json({
      message: "Reward marked as collected successfully.",
      redemption,
    });
  } catch (error) {
    console.error("Redemption collection error:", error.message);

    res.status(500).json({
      message: "Unable to update redemption status.",
    });
  }
});

// Get latest system activities
router.get("/activity", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin access only.",
      });
    }

    const activities = await ActivityLog.find()
      .populate("customer", "fullName email username")
      .populate("performedBy", "fullName username role")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Activity fetch error:", error.message);

    res.status(500).json({
      message: "Unable to fetch recent activities.",
    });
  }
});

module.exports = router;