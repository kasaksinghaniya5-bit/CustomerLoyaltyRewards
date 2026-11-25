const mongoose = require("./server/node_modules/mongoose");
const dotenv = require("./server/node_modules/dotenv");
const path = require("path");

const ProductCode = require("./server/models/ProductCode");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const createTestCode = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingCode = await ProductCode.findOne({
  code: "WEB-REDEMPTION-100",
});

    if (existingCode) {
      console.log("Test code already exists.");
      return;
    }

    await ProductCode.create({
      code: "WEB-REDEMPTION-100",
      productName: "Website Redemption Test Product",
      points: 100,
    });

    console.log("Test product code created successfully!");
  } catch (error) {
    console.error("Error creating test code:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createTestCode();