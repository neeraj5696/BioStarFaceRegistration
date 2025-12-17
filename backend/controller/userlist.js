const { connectDB, sql } = require("../model/db");
const nodemailer = require("nodemailer");
const loginToBioStar = require("../services/Loginservices");
const https = require("https");
const axios = require("axios");
const logger = require("../utils/logger");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const searchEmployees = async (req, res) => {
  try {
    logger.info("Fetching employees from BioStar API");
    const sessionId = await loginToBioStar({
      biostarUrl: process.env.BIOSTAR_URL,
      loginId: process.env.BIOSTAR_LOGIN_ID,
      password: process.env.BIOSTAR_PASSWORD,
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
    const total = result.data?.UserCollection.total || 0
    logger.success("Employees fetched successfully", { totalEmployees: total });

    res.status(200).json({
      users
    });
  } catch (error) {
    logger.error("Failed to fetch employees", { error: error.message });
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

// sending mail

const sendVerificationEmail = async (req, res) => {
  try {
    const { employeeId, email } = req.body;
    logger.info("Verification email request received", { employeeId, email });
    
    if (!employeeId || !email) {
      logger.warning("Email sending failed - Missing data", { employeeId, email });
      return res
        .status(400)
        .json({ message: "Employee ID and email are required" });
    }

    await connectDB();

    // Create encoded data for verification link
    const createdTime = new Date().toISOString();
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const verificationData = {
      employeeId,
      email,
      createdTime,
      expiryTime,
    };

    const base64EncodedData = Buffer.from(
      JSON.stringify(verificationData)
    ).toString("base64");

    // Fetch SMTP credentials from database
    const smtpQuery = `SELECT [SMTPSRVADR], [SMTPSRVPT], [SMTPUSN], [SMTPPW], [SMTPSEC] 
                       FROM [BioStar2_aMay].[dbo].[TMP_T_ALMSMTPSET] 
                       WHERE [NM] = 'smtp-mail'`;

    const smtpResult = await sql.query(smtpQuery);
    // console.log(smtpResult)

    if (smtpResult.recordset.length === 0) {
      return res.status(500).json({ message: "SMTP configuration not found" });
    }

    const smtpConfig = smtpResult.recordset[0];

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.SMTPSRVADR,
      port: smtpConfig.SMTPSRVPT,
      secure: "SSL" === smtpConfig.SMTPSEC, // true for 465, false for other ports
      auth: {
        user: smtpConfig.SMTPUSN,
        pass: smtpConfig.SMTPPW,
      },
    });

    // Email content with encoded verification link
    const frontendUrl = `http://${process.env.FRONTEND_URL}`;
    const verificationLink = `${frontendUrl}/capture?data=${base64EncodedData}`;

    const mailOptions = {
      from: smtpConfig.SMTPUSN,
      to: email,
      subject: "Face Registration Verification",
      html: `
        <h2>Face Registration Verification</h2>
        <p>Dear Employee,</p>
        <p>Please click the link below to complete your face registration verification:</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Verification</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    logger.success("Verification email sent successfully", { employeeId, email });

    res.json({
      message: "Verification email sent successfully",
     
    });
  } catch (error) {
    logger.error("Failed to send verification email", { error: error.message });
    res.status(500).json({
      message: "Error sending verification email",
      error: error.message,
    });
  }
};

module.exports = { searchEmployees, sendVerificationEmail };
