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
const {  searchEmployees, sendVerificationEmail,} = require("./controller/userlist");

const { verifyToken, upload } = require("./controller/verification");
const { uploadPhoto } = require("./services/photoupload");
const { sql } = require("./model/db");

//Employee endpoints
app.get("/api/employees", searchEmployees);
app.post("/api/send-email", sendVerificationEmail);

app.post("/api/uploadphoto", upload.single("image"), uploadPhoto);




//Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(connectDB());
  console.log("Credentials:", process.env.HR_USERNAME, process.env.HR_PASSWORD);
});
