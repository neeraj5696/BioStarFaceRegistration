const axios = require("axios");
require('dotenv').config();
const https = require("https");

const biostarUrl = process.env.BIOSTAR_URL;
const loginId = process.env.BIOSTAR_LOGIN_ID;
const password = process.env.BIOSTAR_PASSWORD;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Simple logger since AppLogger is not defined
const AppLogger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data || ''),
  error: (message, data) => console.error(`[ERROR] ${message}`, data || '')
};

const loginToBioStar = async ({
  biostarUrl,
  loginId,
  password,
  httpsAgent,
}) => {
  try {
    const loginUrl = `${biostarUrl}/api/login`;

    AppLogger.info("Attempting BioStar login", { url: loginUrl });

    const response = await axios.post(
      loginUrl,
      {
        User: {
          login_id: loginId,
          password: password,
        },
      },
      {
        timeout: 10000,
        httpsAgent,
      }
    );

    console.log(response.headers["bs-session-id"]);

    const sessionId = response.headers["bs-session-id"];

    AppLogger.info("BioStar login successful", {
      status: response.status,
      sessionId,
    });

    return sessionId;

  } catch (error) {
    AppLogger.error("BioStar login failed", {
      message: error.message,
      status: error.response?.status,
    });
    throw error;
  }
};

module.exports = loginToBioStar;
