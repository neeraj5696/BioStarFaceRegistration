const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const httpsPort = process.env.PORT || 5000;

// Load mkcert certificates
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem'))
// };

app.use(cors({
  origin: process.env.FRONTEND_URL,
  
  methods: ["GET", "POST", "PUT"],
  credentials: true,
  optionsSuccessStatus: 200,
}));


app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());



const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
app.post("/login", authRouter);
app.get("/csrf-token", authRouter);


const {searchEmployees, sendVerificationEmail, sendBulkVerificationEmails } = require("./controller/userlist");

const { getHistory } = require('./controller/history');
const { upload, uploadPhoto } = require("./services/photoupload");

app.post("/api/employees", searchEmployees);
app.post("/api/send-email", sendVerificationEmail);
app.post("/api/send-bulk-email", sendBulkVerificationEmails);
app.post("/api/uploadphoto", uploadPhoto);

// History endpoint
app.get("/api/history", getHistory);



app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "dist_frontend")));
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist_frontend", "index.html"));
});

app.listen(httpsPort, "0.0.0.0", () => {
  console.log(`🔒 HTTPS Server: http://localhost:${httpsPort}`);
 // console.log(`📱 Mobile: https://192.168.0.166:${httpsPort}`);
  console.log(`✅ Trusted certificates - no browser warnings!`);
});


// for ssl to work 

// https.createServer(sslOptions, app).listen(httpsPort, "0.0.0.0", () => {
//   console.log(`🔒 HTTPS Server: https://localhost:${httpsPort}`);
//  // console.log(`📱 Mobile: https://192.168.0.166:${httpsPort}`);
//   console.log(`✅ Trusted certificates - no browser warnings!`);
// });

module.exports = app;