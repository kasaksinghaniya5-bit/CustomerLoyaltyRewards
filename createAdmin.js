const mongoose = require("./server/node_modules/mongoose");
const dotenv = require("./server/node_modules/dotenv");
const bcrypt = require("./server/node_modules/bcryptjs");

const Customer = require("./server/models/Customer");

dotenv.config({
  path: "./.env",
});

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Customer.findOne({
      email: "admin@loyalty.com",
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@12345", 12);

    await Customer.create({
      fullName: "System Administrator",
      email: "admin@loyalty.com",
      username: "admin",
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("Admin account created successfully.");
    console.log("Email: admin@loyalty.com");
    console.log("Password: Admin@12345");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();