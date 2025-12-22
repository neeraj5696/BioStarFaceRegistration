const nodemailer = require("nodemailer");
const loginToBioStar = require("../services/Loginservices");
const https = require("https");
const axios = require("axios");
const logger = require("../utils/logger");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const SMTPSRVADR = process.env.SMTPSRVADR;
const SMTPSRVPT = parseInt(process.env.SMTPSRVPT) || 587;
const SMTPUSN = process.env.SMTPUSN;
const SMTPPW = process.env.SMTPPW;

const searchEmployees = async (req, res) => {

  const { username, password } = req.body

  try {
    const sessionId = await loginToBioStar({
      biostarUrl: process.env.BIOSTAR_URL,
      loginId: username,
      password: password,
      httpsAgent,
    });

    const result = await axios.get(
      `${process.env.BIOSTAR_URL}/api/users?group_id=1&limit=0&offset=0&order_by=user_id:false&last_modified=0`,
      {
        headers: {
          "bs-session-id": sessionId,
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    );

    const users = result.data?.UserCollection || [];

    // Log user list fetched
    logger.logUserListFetched(users.length, username);

    res.status(200).json({
      users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

// sending mail

const sendVerificationEmail = async (req, res) => {
  try {
    const { employeeId, email, name } = req.body;

    if (!employeeId || !email || !name) {
      return res
        .status(400)
        .json({ message: "Employee ID and email and name are required" });
    }


    // Create encoded data for verification link
    const createdTime = new Date().toISOString();
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const verificationData = {
      employeeId,
      email,
      name,
      createdTime,
      expiryTime,
    };

    const base64EncodedData = Buffer.from(
      JSON.stringify(verificationData)
    ).toString("base64");

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTPSRVADR,
      port: SMTPSRVPT,
      secure: SMTPSRVPT === 465, // true for 465, false for other ports
      auth: {
        user: SMTPUSN,
        pass: SMTPPW,
      },
      tls: {
        rejectUnauthorized: false // For self-signed certificates
      }
    });

    // Email content with encoded verification link
    const frontendUrl = process.env.FRONTEND_URL;
    const verificationLink = `${frontendUrl}/capture?data=${base64EncodedData}`;

    const mailOptions = {
      from: SMTPUSN,
      to: email,
      subject: "Face Registration Verification",
      html: `
        <h2>Face Registration Verification</h2>
        <p>Dear Employee,</p>
        <p>Please click the link below to complete your face registration verification:</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Verification</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Log email sent
    logger.logEmailSent(1, [{ id: employeeId, name: name, email: email }]);

    res.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending verification email",
      error: error.message,
    });
  }
};

module.exports = { searchEmployees, sendVerificationEmail };
