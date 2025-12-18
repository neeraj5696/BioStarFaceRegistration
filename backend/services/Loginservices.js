const axios = require("axios");
require('dotenv').config();
const https = require("https");

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
      throw new Error("No session ID received from BioStar");
    }

    return sessionId;

  } catch (error) {
    throw error;
  }
};

module.exports = loginToBioStar;
