const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const Frontend_Url = process.env.FRONTEND_URL;

const app = express();
const port = process.env.PORT || 5000;

console.log("ENV loaded:", {
  
  BIOSTAR_URL: process.env.BIOSTAR_URL ? "SET" : "NOT_SET",
  Frontend_Url: process.env.FRONTEND_URL 
});

//middleware
app.use(
  cors({
    // Allow configured frontend URL; fall back to reflecting the request origin
    origin: Frontend_Url || true,
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

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

const {
  searchEmployees, sendVerificationEmail, sendBulkVerificationEmails} = require("./controller/userlist");

const { getHistory } = require('./controller/history');


const {upload, uploadPhoto } = require("./services/photoupload");
const logger = require("./utils/logger");


//Employee endpoints
//app.get("api/employees", searchEmployees);
app.post("/api/employees", searchEmployees);
app.post("/api/send-email", sendVerificationEmail);
app.post("/api/send-bulk-email", sendBulkVerificationEmails);

app.post("/api/uploadphoto",  uploadPhoto);

// History endpoint
app.get("/api/history", getHistory);

// Frontend logging endpoint
app.post("/api/log", (req, res) => {
  try {
    const { level, message, data, timestamp, userAgent } = req.body;
    
    // Log to backend logger
    const logMessage = `[FRONTEND] ${message}`;
    const logData = {
      ...data,
      userAgent: userAgent,
      frontendTimestamp: timestamp
    };
    
    switch (level) {
      case 'SUCCESS':
        logger.success(logMessage, logData);
        break;
      case 'ERROR':
        logger.error(logMessage, logData);
        break;
      case 'WARNING':
        logger.warning(logMessage, logData);
        break;
      default:
        logger.info(logMessage, logData);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    // Don't fail the request if logging fails
    res.status(200).json({ success: false, error: error.message });
  }
});

//Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Serve frontend build (dist) - must come after API routes
const distPath = path.join(__dirname, "dist_frontend");
app.use(express.static(distPath));

// SPA fallback: send index.html for any non-API route
// Use regex to avoid Express 5 path-to-regexp "*" issue
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});


app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

// Export for Vercel
module.exports = app;
