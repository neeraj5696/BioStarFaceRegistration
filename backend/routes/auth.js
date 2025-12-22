const express = require("express");
require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const logger = require("../utils/logger");
const biostarturl = process.env.BIOSTAR_URL;
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const router = express.Router();



// CSRF token generation endpoint
router.get("/csrf-token", (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("csrf-token", token, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
  });
  res.json({ csrfToken: token });
});

// CSRF validation middleware
const validateCSRF = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === "GET") {
    return next();
  }

  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies["csrf-token"];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  next();
};

router.post("/login", async (req, res) => {
  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  const { username, password } = req.body;

  //Basic input validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const response = await axios.post(
      `${biostarturl}/api/login`,
      {
        User: {
          login_id: username,
          password: password,
        },
      },
      {
        httpsAgent,
      }
    );

    const sessionId = response.headers["bs-session-id"];

    // Log successful login
    logger.logLoginSuccess(username);

    res.status(200).json({
      message: "Login successful",
      data: {
        username,
        password,
        sessionId,
      },
    });
  } catch (error) {
    // Handle different error types appropriately
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res
        .status(503)
        .json({ message: "Service temporarily unavailable" });
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (error.response?.status >= 500) {
      return res
        .status(503)
        .json({ message: "Service temporarily unavailable" });
    }

    // Generic error response (don't expose internal details)
    res.status(500).json({ message: "Authentication failed" });
  }
});

module.exports = router;
