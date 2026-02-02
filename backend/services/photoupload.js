const axios = require("axios");
const https = require("https");
const multer = require('multer');
const path = require('path');
const loginToBioStar = require("./Loginservices");
const { markEnrollmentSuccess } = require('../controller/history');
const logger = require('../utils/logger');

// Create HTTPS agent to handle self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const uploadPhoto = async (req, res) => {
  try {
    const { employeeId, email, name } = req.body;

    // Validate request data
    if (!req.body.employeeId || !req.body.image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employeeId and image"
      });
    }

    let sessionId;
    try {
      sessionId = await loginToBioStar({
        biostarUrl: process.env.BIOSTAR_URL,
        loginId: process.env.BIOSTAR_LOGIN_ID,
        password: process.env.BIOSTAR_PASSWORD,
        httpsAgent,
      });
    } catch (loginError) {

      console.log(loginError.response.data.Response.message)
      return res.status(501).json({
        success: false,
        message:loginError.response.data.Response.message|| "Failed to authenticate BioStar systemm",
        error: loginError.response?.data
      });
    }

    if (!sessionId) {
      return res.status(502).json({
        success: false,
        message: "Failed to authenticate BioStar systemm",
      });
    }



    // Update user face data
    try {
      const userId = req.body.employeeId;

      // Clean the base64 image
      let cleanImage;
      try {
        cleanImage = req.body.image.startsWith("data:")
          ? req.body.image.split(",")[1]
          : req.body.image;

        if (!cleanImage || cleanImage.length === 0) {
          throw new Error("Invalid image data");
        }
      } catch (imageError) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format",
          error: imageError.message
        });
      }
      console.log(cleanImage)
      const updateResponse = await axios.put(
        `${process.env.BIOSTAR_URL}/api/users/${userId}`,
        {
          User: {
            credentials: {
              visualFaces: [
                {
                  template_ex_normalized_image: cleanImage,
                  templates: [
                    {
                      credential_bin_type: "9",
                      "index": 0,
                      template_ex:
                        "bG5kL2hIeDloSDlpZ0daN2VuV0VsM3VCajN0dGc2Ti9lWGRvZzFxUmY0ZHNnWGgrcUg2SmU1Q1Fhb0tSaVY1MmUyNTNkcEtPZVlWems1R1Vob0tSZjV1bWdaR05nbkI1aG5lRmNYZDBkNUJza29KK2g0cVNnV2FXWjVKMGlIT0RoMytQaG55QmZYeVFpWGFFZklObmwzSjdtNE9BZzNaNGVvMkJtM2h5ZllXWWhYcVNhWUp0a25kL2JYV2NoM1Y4YkpSL2RIeGliNFYrZ21TSWpHMkNnb1puZFlaL21uZDNjM1YvZTM2TWZZNXFuSkpyb0hxTWc0ZUxqWHlSaElaeWk0RmplSXlYblpHTmNZR0dmV3QvYllOaWhZNS9oSEYxZ0kxN2hJT1Bhbjk4ZG90M2c0bUhmbjZoZ1hhSGVZQm9ibktHZ1hSeWQzT0llblNKY0hOemtaRjVjRzl6ZTNSOWZYOTlrSUY5ZTI5bmJJNldmSUtTYm95RmY0RjlobnlQZ0cxd2hveVFnbnFHWjRkN21uNkRqSTZLam5lVGRIbDNnbjk5Zm8xK2ZKR1dnblNIaDVHUGRIdUNnSVNTZkcrRmhHNXhpWWRpaUkrS2taSitoWVNaZW9tR2daZDdYM2VNZlhlQ2ZuNStqWGFTaW5sNlgzWjhpWXVHY0haM2ZvbWhmcEJ6ZzMyTGVwVnphWEoxZG9aOWRJMk5mb3QzY1Z4OWcyNkFrbk9F"
                    },

                  ],
                },
              ],
            },
          },
        },
        {
          headers: {
           
            "Content-Type": "application/json",
             "bs-session-id": sessionId,
          },
          httpsAgent,
        }
      );

      // Mark enrollment as success in HISTORY JSON FILE

      markEnrollmentSuccess(req.body.employeeId);

      // Log photo upload success to LOG TXT FILE
      logger.logPhotoUpdated(req.body.employeeId, name || 'Unknown', email || null);

      console.log("Photo updated successfully for user:", updateResponse);
      res.status(200).json({
        data: {
          success: true,
          message: "Photo uploaded and face updated successfully",
          data: updateResponse.data,
          employeeId: req.body.employeeId,
          status: updateResponse.status,
          message: updateResponse.data.message,
          data: updateResponse.data.data
        },
      });
    } catch (updateError) {

      console.error("Error updating user face data:", updateError.response?.data?.Response?.message)
      res.status(500).json({

        success: false,
        message: updateError.response?.data?.Response?.message || "Photo upload failed while updating face data",
        error: updateError.message,
        sessionId: sessionId,
        details: updateError.response?.data || null,
        status: updateError.status || null,

      });
    }
  } catch (error) {
    console.error("Unexpected error in uploadPhoto:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload photo",
      error: error.message,
      details: error.response?.data || null,
    });
  }
};


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
    fileSize: 9 * 1024 * 1024, // 9MB limit
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

module.exports = { uploadPhoto, upload };
