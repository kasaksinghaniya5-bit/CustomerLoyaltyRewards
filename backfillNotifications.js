const mongoose = require("./server/node_modules/mongoose");
const dotenv = require("./server/node_modules/dotenv");
const path = require("path");

const Redemption = require("./server/models/Redemption");
const Notification = require("./server/models/Notification");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const backfillNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    const redemptions = await Redemption.find();
    let createdCount = 0;

    for (const redemption of redemptions) {
      const redemptionMessage =
        `You redeemed ${redemption.rewardName} for ${redemption.pointsSpent.toLocaleString(
          "en-IN"
        )} points. Your collection code is ${redemption.redemptionCode}.`;

      const existingRedemptionNotification =
        await Notification.findOne({
          customer: redemption.customer,
          type: "redemption",
          message: redemptionMessage,
        });

      if (!existingRedemptionNotification) {
        await Notification.create({
          customer: redemption.customer,
          type: "redemption",
          title: "Reward redeemed successfully",
          message: redemptionMessage,
        });

        createdCount++;
      }

      if (redemption.status === "cancelled") {
        const cancellationMessage =
          `${redemption.rewardName} was cancelled and ${redemption.pointsSpent.toLocaleString(
            "en-IN"
          )} points were refunded to your account.`;

        const existingCancellationNotification =
          await Notification.findOne({
            customer: redemption.customer,
            type: "cancellation",
            message: cancellationMessage,
          });

        if (!existingCancellationNotification) {
          await Notification.create({
            customer: redemption.customer,
            type: "cancellation",
            title: "Redemption cancelled",
            message: cancellationMessage,
          });

          createdCount++;
        }
      }
    }

    console.log(`${createdCount} historical notifications created.`);
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

backfillNotifications();