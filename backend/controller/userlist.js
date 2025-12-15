const { connectDB, sql } = require("../model/db");
const nodemailer = require("nodemailer");

const searchEmployees = async (req, res) => {
  try {
    await connectDB();
    const { search = "" } = req.query;
    console.log("Search value from frontend:", search, "Type:", typeof search);

    let query = `SELECT [USRID] as id, [NM] as name, [EML] as email 
     FROM [BioStar2_aMay].[dbo].[T_USR]`;

    if (search) {
      // Use string comparison for all fields since USRID is varchar(128)
      query += ` WHERE [USRID] LIKE '%${search}%' 
      OR [NM] LIKE '%${search}%' 
      OR [EML] LIKE '%${search}%'`;
    }

    query += ` ORDER BY [NM]`;
    console.log("Final query:", query);

    const result = await sql.query(query);
    console.log("Query result count:", result.recordset.length);
    if (result.recordset.length > 0) {
      // console.log("Sample USRID values:", result.recordset.slice(0, 3).map(r => r.id));
    } else if (search && !isNaN(search)) {
      // If no results for numeric search, show some sample USRIDs to debug
      const sampleQuery = `SELECT TOP 10 [USRID] as id FROM [BioStar2_aMay].[dbo].[T_USR] ORDER BY [USRID]`;
      const sampleResult = await sql.query(sampleQuery);
      console.log(
        "Available USRID samples:",
        sampleResult.recordset.map((r) => r.id)
      );
    }
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
};

// sending mail

const sendVerificationEmail = async (req, res) => {
  try {
    const { employeeId, email } = req.body;
    console.log(employeeId, email);

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
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
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

    res.json({
      message: "Verification email sent successfully",
      verificationLink,
      encodedData: base64EncodedData,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({
      message: "Error sending verification email",
      error: error.message,
    });
  }
};

module.exports = { searchEmployees, sendVerificationEmail };
