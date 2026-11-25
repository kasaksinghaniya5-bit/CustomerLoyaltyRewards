const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const router = express.Router();

// Customer Registration
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    // Check required fields
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    // Validate username
    const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

    if (!usernamePattern.test(cleanUsername)) {
      return res.status(400).json({
        message:
          "Username must be 3–20 characters and contain only letters, numbers or underscores.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    // Check whether email or username already exists
    const existingCustomer = await Customer.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanUsername },
      ],
    });

    if (existingCustomer) {
      if (existingCustomer.email === cleanEmail) {
        return res.status(409).json({
          message: "This email address is already registered.",
        });
      }

      return res.status(409).json({
        message: "This username is already taken.",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer account
    const newCustomer = await Customer.create({
      fullName: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Customer account created successfully!",
      customer: {
        id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        username: newCustomer.username,
        role: newCustomer.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or username is already registered.",
      });
    }

    res.status(500).json({
      message: "Something went wrong during registration.",
    });
  }
});

// Customer Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find customer by email
    const customer = await Customer.findOne({
      email: cleanEmail,
    });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Check account status
    if (customer.status !== "active") {
      return res.status(403).json({
        message: "Your account is currently suspended.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: customer._id,
        role: customer.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        username: customer.username,
        role: customer.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Something went wrong during login.",
    });
  }
});

module.exports = router;