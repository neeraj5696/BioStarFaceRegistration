const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const httpsPort = process.env.PORT || 5000;

//Load mkcert certificates
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem'))
};

app.use(cors({
  origin: process.env.FRONTEND_URL,
  
  methods: ["GET", "POST", "PUT"],
  credentials: true,
  optionsSuccessStatus: 200,
}));


app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());



const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
app.post("/login", authRouter);
app.get("/csrf-token", authRouter);


const {searchEmployees, sendVerificationEmail, sendBulkVerificationEmails } = require("./controller/userlist");

const { getHistory } = require('./controller/history');
const { upload, uploadPhoto } = require("./services/photoupload");
const logger = require("./utils/logger");

app.post("/api/employees", searchEmployees);
app.post("/api/send-email", sendVerificationEmail);
app.post("/api/send-bulk-email", sendBulkVerificationEmails);
app.post("/api/uploadphoto", uploadPhoto);

// History endpoint
app.get("/api/history", getHistory);

app.post("/api/log", (req, res) => {
  try {
    const { level, message, data, timestamp, userAgent } = req.body;
    const logMessage = `[FRONTEND] ${message}`;
    const logData = { ...data, userAgent, frontendTimestamp: timestamp };

    switch (level) {
      case 'SUCCESS': logger.success(logMessage, logData); break;
      case 'ERROR': logger.error(logMessage, logData); break;
      case 'WARNING': logger.warning(logMessage, logData); break;
      default: logger.info(logMessage, logData);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(200).json({ success: false, error: error.message });
  }
});


//visitor routes
const {addVisitor} = require("./controller/visitor")
app.post("/api/addVisitor", addVisitor)



app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "dist_frontend")));
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist_frontend", "index.html"));
});

// app.listen(httpsPort, "0.0.0.0", () => {
//   console.log(`🔒 HTTPS Server: http://localhost:${httpsPort}`);
//  // console.log(`📱 Mobile: http://192.168.0.166:${httpsPort}`);
//   console.log(`✅ Trusted certificates - no browser warnings!`);
// });

https.createServer(sslOptions,app).listen(httpsPort, "0.0.0.0", () => {
  console.log(`🔒 HTTPS Server: https://localhost:${httpsPort}`);
  console.log(`📱 Mobile: https://192.168.0.166:${httpsPort}`);
  console.log(`✅ Trusted certificates - no browser warnings!`);
});



module.exports = app;