const axios = require("axios");
require('dotenv').config();
const https = require("https");
const logger = require("../utils/logger");

const biostarUrl = process.env.BIOSTAR_URL;
const loginId = process.env.BIOSTAR_LOGIN_ID;
const password = process.env.BIOSTAR_PASSWORD;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const loginToBioStar = async ({
  biostarUrl,
  loginId,
  password,
  httpsAgent,
}) => {
  try {
    const loginUrl = `${biostarUrl}/api/login`;

    logger.info("Attempting BioStar API login");

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

    const sessionId = response.headers["bs-session-id"];
    
    if (!sessionId) {
      logger.error("BioStar login failed - No session ID received", { status: response.status });
      throw new Error("No session ID received from BioStar");
    }

    logger.success("BioStar API login successful");

    return sessionId;

  } catch (error) {
    logger.error("BioStar API login failed", { error: error.message, status: error.response?.status });
    throw error;
  }
};

module.exports = loginToBioStar;
