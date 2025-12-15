const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

console.log("ENV loaded:", process.env.HR_USERNAME, process.env.HR_PASSWORD);

//middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body keys:", Object.keys(req.body));
  }
  next();
});

const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

//HR login page

app.post("/login", authRouter);
const { connectDB } = require("./model/db");
const {
  searchEmployees,
  sendVerificationEmail,
} = require("./controller/userlist");

const { verifyToken, upload } = require("./controller/verification");
const { uploadPhoto } = require("./services/photoupload");
const { sql } = require("./model/db");

//Employee endpoints
app.get("/api/employees", searchEmployees);
app.post("/api/send-email", sendVerificationEmail);

//Verification endpoints

app.post("/api/uploadphoto", upload.single("image"), uploadPhoto);

// Test endpoint to check database tables
app.get("/api/test-db", async (req, res) => {
  try {
    await connectDB();

    // Check if tables exist
    const tablesQuery = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME IN ('VerificationRequests', 'CapturedPhotos')
    `;

    const tablesResult = await sql.query(tablesQuery);

    res.json({
      message: "Database connection successful",
      existingTables: tablesResult.recordset,
      allTables: await sql.query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
      ),
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ error: error.message });
  }
});

//Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(connectDB());
  console.log("Credentials:", process.env.HR_USERNAME, process.env.HR_PASSWORD);
});
