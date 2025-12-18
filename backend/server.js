const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const Frontend_Url = process.env.FRONTEND_URL;

const app = express();
const port = process.env.PORT || 5000;

console.log("ENV loaded:", {
  HR_USERNAME: process.env.HR_USERNAME ? "***" : "NOT_SET",
  HR_PASSWORD: process.env.HR_PASSWORD ? "***" : "NOT_SET",
  BIOSTAR_URL: process.env.BIOSTAR_URL ? "SET" : "NOT_SET",
  Frontend_Url: process.env.FRONTEND_URL 
});

//middleware
app.use(
  cors({
    origin: Frontend_Url, // Your frontend URL
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

app.get('/', (req, res) => {
  res.send('Hello, this is the home page!');
});

// POST request for "/"
app.post('/', (req, res) => {
  res.send('POST request received at /');
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

app.post("/api/uploadphoto", upload.single("image"), uploadPhoto);

//Serve uploaded files
app.use("/uploads", express.static("uploads"));

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export for Vercel
module.exports = app;
