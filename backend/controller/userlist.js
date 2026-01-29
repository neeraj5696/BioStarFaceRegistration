const nodemailer = require("nodemailer");
const loginToBioStar = require("../services/Loginservices");
const https = require("https");
const axios = require("axios");
const { addMailSent } = require('./history');
const logger = require('../utils/logger');
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
      `${process.env.BIOSTAR_URL}/api/users?group_id=1&limit=500&offset=0&order_by=user_id:false&last_modified=0`,
      {
        headers: {
          "bs-session-id": sessionId,
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    );

    const users1 = result.data?.UserCollection || [];
    // console.log(users)
    let employee = []
    if (users1.rows && Array.isArray(users1.rows)) {
      employee = users1.rows.map((emp) => ({
        id: emp.user_id,
        name: emp.name,
        email: emp.email || "",
        department: emp.department || "N/A",
        user_group_id: emp.user_group_id,

      }));


    } else {
      console.error('data not found in api')
    }

    // console.log(employee)
    const total = users1?.total ?? 0;


    const data = { total: total, rows: employee }
    // console.log(data)






    res.status(200).json({
      data,
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
    const expiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

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
      secure: SMTPSRVPT === 465,
      auth: {
        user: SMTPUSN,
        pass: SMTPPW,
      },
      pool: true, // Enable connection pooling
      maxConnections: 5, // Max concurrent connections
      maxMessages: 100, // Max messages per connection
      tls: {
        rejectUnauthorized: false
      }
    });


    // Email content with encoded verification link
    // Always use the current host (frontend is served by backend)
    const baseUrl = process.env.BASE_URL
    const Public_Url = process.env.PUBLIC_URL
    const VerificationLink = `${baseUrl}/capture?data=${base64EncodedData}`;
    const Verification_Link = `${Public_Url}/capture?data=${base64EncodedData}`;

    const mailOptions = {
      from: SMTPUSN,
      to: email,
      subject: "Urgent !! KRMU - Face Enrollment",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Face Registration Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center;">
                      <h2 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">Face Registration Verification</h2>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: 500;">Dear Mr./Ms.${name} (Student/Staff/Faculty)</p>
                      
                      <p style="color: #34495e; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">K R Mangalam University is in the process of implementing a secure facial recognition–based access control system at campus entry gate.</p>
                      
                      <p style="color: #34495e; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">You are requested to complete your face enrollment to ensure seamless access to the campus.</p>
                      
                      <p style="color: #34495e; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">The enrollment must be completed by clicking on this link and following the on-screen instructions carefully.</p>
                      
                      <!-- SSL Warning Notice -->
                      <div style="background-color: #fff3cd; border: 2px solid #ff9800; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <p style="color: #d32f2f; font-size: 15px; line-height: 1.7; margin: 0 0 10px 0; font-weight: 600;">⚠️ IMPORTANT: Browser Security Warning</p>
                        <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">When you click the link below, your browser may show a warning: <strong>"Your connection is not private"</strong></p>
                        <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0; font-weight: 500;">Please follow these steps to proceed:</p>
                        <ol style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                          <li>Click on <strong>"Advanced"</strong> button</li>
                          <li>Then click on <strong>"Proceed to biostar.krmangalam.edu.in (unsafe)"</strong></li>
                        </ol>
                        <p style="color: #27ae60; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0; font-weight: 600;">✓ You are Safe, It is just warning - This is our internal university system.</p>
                      </div>
                      
                      <p style="color: #34495e; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">Click on this link to complete the enrollment process</p>
                      
                      <!-- Campus Link Section -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #2c3e50; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0; font-weight: 500;">Inside the Campus on University Internet/p>
                        <div style="text-align: center; margin: 20px 0;">
                          <a href="${VerificationLink}" style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: grey; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 3px 10px rgba(46, 204, 113, 0.3); transition: all 0.3s ease;">Complete Verification</a>
                        </div>
                      </div>
                      
                      <!-- Outside Campus Link Section -->
                      <div style="background-color: #fff5f5; border-left: 4px solid #e74c3c; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #2c3e50; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0; font-weight: 500;">Outside the compus on Mobile Internet</p>
                        <div style="text-align: center; margin: 20px 0;">
                          <a href="${Verification_Link}" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: grey; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3); transition: all 0.3s ease;">Complete Verification</a>
                        </div>
                      </div>
                      
                      <!-- Important Notice -->
                      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <p style="color: #856404; font-size: 15px; line-height: 1.7; margin: 0; font-weight: 500;">⚠️ Note: The enrollment link will remain active for 7 days only.</p>
                      </div>
                      
                      <p style="color: #27ae60; font-size: 15px; line-height: 1.7; margin: 25px 0 20px 0; font-weight: 500;">We look forward to your successful registration.</p>
                      
                      <!-- Support Section -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <p style="color: #34495e; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">In case of difficulty accessing the enrollment link or if any technical issues arise during the registration process, please contact <a href="mailto:techsupport@krmangalam.edu.in" style="color: #3498db; text-decoration: none; font-weight: 500;">techsupport@krmangalam.edu.in</a>.</p>
                        
                        <p style="color: #34495e; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">If an HTTP Status 400 - Bad Request error is encountered, users are advised to retry after some time, as the server may be busy</p>
                        
                        <p style="color: #34495e; font-size: 14px; line-height: 1.6; margin: 0;">Click on INSTRUCTION to view the detailed step-by-step face enrollment guide.</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #2c3e50; padding: 25px; text-align: center;">
                      <p style="color: #bdc3c7; font-size: 13px; margin: 0; line-height: 1.5;">© K R Mangalam University<br>This is an automated message, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send email
  const mailresult=  await transporter.sendMail(mailOptions);
  console.log("Mail sent result:", mailresult);


    transporter.close();

    // Add to history
    addMailSent(employeeId, name, email);

    // Log individual email sent
    logger.logEmailSent(1, [{ id: employeeId, name, email }]);

    res.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({
      message: "Error sending verification email",
      error: error.message,
    });
  }
};

// Bulk email sending endpoint
const sendBulkVerificationEmails = async (req, res) => {
  try {
    const { employees } = req.body;

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: "Employees array is required" });
    }

    // Create transporter with connection pooling
    const transporter = nodemailer.createTransport({
      host: SMTPSRVADR,
      port: SMTPSRVPT,
      secure: SMTPSRVPT === 465,
      auth: {
        user: SMTPUSN,
        pass: SMTPPW,
      },
      pool: true, // Enable pooling
      maxConnections: 5, // Max 5 concurrent connections
      maxMessages: 100, // Max 100 messages per connection
      rateDelta: 1000, // 1 second
      rateLimit: 10, // Max 10 emails per second
      tls: {
        rejectUnauthorized: false
      }
    });

    const baseUrl = process.env.BASE_URL;
    const Public_Url = process.env.PUBLIC_URL;

    const results = {
      success: [],
      failed: []
    };

    // Send emails with rate limiting
    for (const emp of employees) {
      try {
        const { id, name, email } = emp;

        if (!id || !name || !email) {
          results.failed.push({ id, email, error: "Missing required fields" });
          continue;
        }

        const createdTime = new Date().toISOString();
        const expiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const verificationData = {
          employeeId: id,
          email,
          name,
          createdTime,
          expiryTime,
        };

        const base64EncodedData = Buffer.from(
          JSON.stringify(verificationData)
        ).toString("base64");

        const VerificationLink = `${baseUrl}/capture?data=${base64EncodedData}`;
        const Verification_Link = `${Public_Url}/capture?data=${base64EncodedData}`;

        const mailOptions = {
          from: SMTPUSN,
          to: email,
          subject: "Urgent !! KRMU - Face Enrollment",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Face Registration Verification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center;">
                          <h2 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">Face Registration Verification</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-weight: 500;">Dear Mr./Ms.${name} (Student/Staff/Faculty)</p>
                          <p style="color: #34495e; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">K R Mangalam University is in the process of implementing a secure facial recognition–based access control system at campus entry gate.</p>
                          <p style="color: #34495e; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">You are requested to complete your face enrollment to ensure seamless access to the campus.</p>
                          
                          <div style="background-color: #fff3cd; border: 2px solid #ff9800; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <p style="color: #d32f2f; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">⚠️ Browser Security Warning</p>
                            <p style="color: #856404; font-size: 13px; margin: 0 0 8px 0;">If you see "Your connection is not private" warning:</p>
                            <p style="color: #856404; font-size: 13px; margin: 0 0 8px 0;">Click <strong>Advanced</strong> → <strong>Proceed to biostar.krmangalam.edu.in (unsafe)</strong></p>
                            <p style="color: #27ae60; font-size: 13px; margin: 0; font-weight: 600;">✓ You are Safe, It is just warning - This is our internal university system.</p>
                          </div>
                          
                          <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                            <p style="color: #2c3e50; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0; font-weight: 500;">Inside the Campus on University Internet</p>
                            <div style="text-align: center; margin: 20px 0;">
                              <a href="${VerificationLink}" style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Verification</a>
                            </div>
                          </div>
                          <div style="background-color: #fff5f5; border-left: 4px solid #e74c3c; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                            <p style="color: #2c3e50; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0; font-weight: 500;">On Mobile Internet use this link</p>
                            <div style="text-align: center; margin: 20px 0;">
                              <a href="${Verification_Link}" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Verification</a>
                            </div>
                          </div>
                          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <p style="color: #856404; font-size: 15px; margin: 0; font-weight: 500;">⚠️ Note: Link active for 7 days only.</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #2c3e50; padding: 25px; text-align: center;">
                          <p style="color: #bdc3c7; font-size: 13px; margin: 0;">© K R Mangalam University<br>This is an automated message.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        };

        // await transporter.sendMail(mailOptions);


        //Add to log
        results.success.push({ id, email });

        // Add to history
        addMailSent(id, name, email);

      } catch (error) {
        results.failed.push({ id: emp.id, email: emp.email, error: error.message });
      }
    }

    // Close transporter
    transporter.close();

    // Log bulk emails sent
    if (results.success.length > 0) {
      logger.logEmailSent(
        results.success.length,
        results.success.map(emp => ({
          id: emp.id,
          name: employees.find(e => e.id === emp.id)?.name || 'Unknown',
          email: emp.email
        }))
      );
    }

    res.json({
      message: "Bulk email sending completed and Log and History Written",
      total: employees.length,
      success: results.success.length,
      failed: results.failed.length,
      failedEmails: results.failed
    });

  } catch (error) {
    res.status(500).json({
      message: "Error sending bulk verification emails",
      error: error.message,
    });
  }
};

module.exports = { searchEmployees, sendVerificationEmail, sendBulkVerificationEmails };
