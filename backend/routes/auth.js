const express = require("express");
require("dotenv").config();
const axios = require("axios");

const router = express.Router();

const username = process.env.HR_USERNAME;
const password = process.env.HR_PASSWORD;

if (!username || !password) {
  throw new Error(
    "HR_USERNAME and HR_PASSWORD must to be set in environment variables"
  );
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  

  //Basic input validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  console.log("Attempting login with:", { username, password });

  try {
    const response = await axios.post(
      "https://192.168.0.208:448/api/login",
      {
        User: {
          login_id: username,
          password: password,
        },
      },
      {
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false,
        }),
      }
    );

    
    const sessionId = response.headers['bs-session-id'];
    console.log("API Status:", response.status);
    console.log("Session ID:", sessionId);

    res.status(200).json({
      message: "Login successful",
      data: { 
        username,
        password,
        sessionId 
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    res.status(401).json({ message: "Invalid credentials" });
  }
});

module.exports = router;
