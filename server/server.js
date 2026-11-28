
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

const customerRoutes = require("./routes/customerRoutes");

app.use("/api/customer", customerRoutes);

const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Customer Loyalty Rewards API is running!");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
