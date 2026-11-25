
const mongoose = require("./server/node_modules/mongoose");
const dotenv = require("./server/node_modules/dotenv");
const path = require("path");

const Reward = require("./server/models/Reward");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const sampleRewards = [
  {
  name: "Test Reward",
  category: "Testing",
  description: "A reward created to test the redemption system.",
  pointsCost: 100,
  stock: 10,
},
  {
    name: "Wireless Headphones",
    category: "Electronics",
    description: "Enjoy your favourite music with wireless comfort.",
    pointsCost: 1500,
    stock: 10,
  },
  {
    name: "Premium Coffee Mug",
    category: "Lifestyle",
    description: "A stylish mug for your everyday coffee moments.",
    pointsCost: 500,
    stock: 20,
  },
  {
    name: "Everyday Backpack",
    category: "Accessories",
    description: "A practical backpack for everyday adventures.",
    pointsCost: 2000,
    stock: 5,
  },
];

const createTestRewards = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const rewardData of sampleRewards) {
      const existingReward = await Reward.findOne({
        name: rewardData.name,
      });

      if (existingReward) {
        console.log(`${rewardData.name} already exists.`);
        continue;
      }

      await Reward.create(rewardData);
      console.log(`${rewardData.name} created successfully!`);
    }
  } catch (error) {
    console.error("Error creating test rewards:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createTestRewards();
