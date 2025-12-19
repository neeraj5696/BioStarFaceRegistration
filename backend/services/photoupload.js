const axios = require("axios");
const https = require("https");
const loginToBioStar = require("./Loginservices");

// Create HTTPS agent to handle self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const uploadPhoto = async (req, res) => {
  try {
    const { employeeId, email } = req.body;

    let sessionId;
    try {
      sessionId = await loginToBioStar({
        biostarUrl: process.env.BIOSTAR_URL,
        loginId: process.env.BIOSTAR_LOGIN_ID,
        password: process.env.BIOSTAR_PASSWORD,
        httpsAgent,
      });
    } catch (loginError) {
      return res.status(401).json({
        success: false,
        message: "Failed to authenticate with BioStar system",
        error: loginError.message
      });
    }

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "No valid session ID obtained"
      });
    }

    // Validate request data
    if (!req.body.employeeId || !req.body.image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employeeId and image"
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


      // let checkingimage;
      // try {
      //   checkingimage = await axios.put(
      //     `${process.env.BIOSTAR_URL}/api/users/check/upload_picture`,
      //     {
      //       User: {
      //         credentials: {
      //           visualFaces: [
      //             {
      //               template_ex_normalized_image: cleanImage,
      //             },
      //           ],
      //         },
      //       },
      //     },
      //     {
      //       headers: {
      //         "bs-session-id": sessionId,
      //         "Content-Type": "application/json",
      //       },
      //       httpsAgent,
      //     }
      //   );

      //   console.log("Checking image response:", {
      //     status: checkingimage.status,
      //     data: checkingimage.data,
      //   });
      // } catch (checkError) {
      //   console.error(
      //     "Error checking image before update:",
      //     checkError.message,
      //     checkError.response
      //   );
      //   return res.status(400).json({
      //     success: false,
      //     message: "Image check failed before updating user",
      //     error: checkError.message,
      //     details: checkError.response?.data || null,
      //   });
      // }

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
                      credential_bin_type: "5",
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
            "bs-session-id": sessionId,
            "Content-Type": "application/json",
          },
          httpsAgent,
        }
      );

      res.status(200).json({
        data: {
          success: true,
          message: "Photo uploaded and face updated successfully",
          data: updateResponse.data,
          employeeId: req.body.employeeId,
        },
      });
    } catch (updateError) {
      // Still return success since login worked
      res.status(400).json({
        data: {
          success: false,
          message: "Login successful but user update failed",
          error: updateError.message,
          sessionId: sessionId,
          details: updateError.response?.data || null,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload photo",
      error: error.message,
      details: error.response?.data || null,
    });
  }
};

module.exports = { uploadPhoto };
