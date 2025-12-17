const { connectDB, sql } = require("../model/db");
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = 'uploads/photos/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `face-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    await connectDB();
    
    const result = await sql.query(`
      SELECT vr.id, vr.employee_id, vr.status, vr.expires_at, u.NM as name, u.EML as email
      FROM VerificationRequests vr
      JOIN [BioStar2_aMay].[dbo].[T_USR] u ON vr.employee_id = u.USRID
      WHERE vr.token = '${token}' AND vr.status = 'pending' AND vr.expires_at > GETDATE()
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    res.json({ 
      message: "Token valid", 
      employee: result.recordset[0] 
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Error verifying token" });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    const { employeeId, email, timestamp } = req.body;
    const photoFile = req.file;

    if (!photoFile) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    if (!employeeId || !email) {
      return res.status(400).json({ message: "Employee ID and email are required" });
    }

    await connectDB();

    // Verify employee exists
    const employeeResult = await sql.query(`
      SELECT USRID, NM, EML FROM [BioStar2_aMay].[dbo].[T_USR] 
      WHERE USRID = '${employeeId}' AND EML = '${email}'
    `);

    if (employeeResult.recordset.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const imageUrl = `/uploads/photos/${photoFile.filename}`;

    // Create verification request record
    const insertRequest = await sql.query(`
      INSERT INTO VerificationRequests (employee_id, status, created_at, completed_at)
      OUTPUT INSERTED.id
      VALUES ('${employeeId}', 'completed', GETDATE(), GETDATE())
    `);

    const requestId = insertRequest.recordset[0].id;

    // Save photo record
    await sql.query(`
      INSERT INTO CapturedPhotos (request_id, image_url, created_at)
      VALUES (${requestId}, '${imageUrl}', GETDATE())
    `);

    res.json({ 
      message: "Face registration completed successfully",
      imageUrl,
      employee: employeeResult.recordset[0]
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    
    // Don't expose internal error details to client
    const isValidationError = error.message && (
      error.message.includes('required') || 
      error.message.includes('not found') ||
      error.message.includes('invalid')
    );
    
    if (isValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error occurred" });
    }
  }
};

module.exports = { verifyToken, uploadPhoto, upload };