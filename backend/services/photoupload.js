const axios = require("axios");
const https = require("https");
const loginToBioStar = require("./Loginservices");

// Create HTTPS agent to handle self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const uploadPhoto = async (req, res) => {
  try {
    // 1. Console log received data
    // console.log("Received data from frontend:", {
    //   //  body: req.body,
    //   image: req.body.image ,
    //   employeeId: req.body.employeeId,
    //   email: req.body.email,
    //   timestamp: req.body.timestamp,
    // });

    // 2. Login to BioStar and get sessionId

    const sessionId = await loginToBioStar({
      biostarUrl: process.env.BIOSTAR_URL,
      loginId: process.env.BIOSTAR_LOGIN_ID,
      password: process.env.BIOSTAR_PASSWORD,
      httpsAgent,
    });
    console.log("BioStar Login ho gaya:", sessionId);

    // 4. Update user face data
    try {
      console.log("Attempting to update user:", req.body.employeeId);
      const userId = req.body.employeeId;

      // Clean the base64 image
      const cleanImage = req.body.image.startsWith("data:")
        ? req.body.image.split(",")[1]
        : req.body.image;

      console.log(cleanImage.slice(0, 30)); // Log the first 30 characters of the cleaned image

      const updateResponse = await axios.put(
        `${process.env.BIOSTAR_URL}/api/users/${userId}`,
        {
          User: {
            credentials: {
              visualFaces: [
                {
                  template_ex_normalized_image: cleanImage, // base64 stat with /9j
                  templates: [
                    {
                      credential_bin_type: "9",
                      template_ex:
                        "AAABAAEAVgHZAa8A4wAAAAAAWFVLREUAAAAAdVANMQFkcAAAOQAAAIWEdn+Din+Ed4GCg3eAhHl4gX6OdI56foZ7e3yGe4d7d4OIfnaFgYJ/goB7eniCgXx8gYSEhHqBfXp/eoJ2f4GFcYCAfYV7gYZ3d3l4hHqEfI94cYCDg3+Bf397iYyAgHx7gIp4hol2gnx7hYGAe4KGf4J+gYR+fneJd319gouMf4CAgoWKe3p/hH1/g3pygH57eYGCfop/eoCAi3l6c3d7hIaAiICCfnyIc3qCdXx9en2AeH6DgXp9e4CDe4yGfIKEfoKGgXiCgYOEhnl4foCDf3uFg3qBgIF2g3J8foSBeXh7gYOCgYB6iIR9enx7dYR/fX6AgoCCgXh8fXyAeXuAfYmGiXd9f4p2gXqBgoh7hXl8hXuCgoGCgYZ+e3p/hYSBgomLgnOBf3uCe4WEhIx6fnt4eYZ8gnt7hnp7gHqFfoF/fYCAhIKCgnaDenyJf3t+goh4hYV2goN7g4eNfYOBd4KLgoSBh3qAhn5/joGDgYF6gH6HfYlzhop9hH6AeYGAgH9/gIt/iYJ+god9jYOCgoR/g4WCg3WCg4B4hXl8fYR5iYGAg353g3R6fYd7d3WHgX1xf3t4gYWIeYKEe3h8eoOBf3WGdYCChIR7foiDgX56hYh+eX6AiXuBfXiAdomAeoB+doSCf4aFgXmDgX2AfYp9fH2KfIR6foJwfIOB",
                    },
                    {
                      credential_bin_type: "5",
                      template_ex:
                        "AAABAAEAKgHyAaUA1wBj8vP2XEpVQSt0dQAAhQApwwBkcAAAOQAAAIR9eH6CiHmDeIJ+hHp/fX54eoOMdol5f4d9fYGHfoSAfHiAenuJgYZ8g3yAfXmBg36CgoGGhn6Ce3eDeXp3eIWGbnqGfJF4hIl4cX54gX+Ceod8cIJ9g32CgH+AhoeBgH12go57h4F4iXh6g31+gX+BdnyKhYKCfXqLeX2AgomMfYR/foKDgXt7hHp/fXh6g315dnp/f4N8f3h9g3Z+c3J7hH9/gYaFfoGKd3yHeXl/d3+AeXd+fYR8fn2Dd4OGfoF8hIGCgn+DfH+HhXp/e4V9fHiAhXeBgX94f3F6hIeBent8fYCAg4J1hnl+c4F6doZ9g32JhnuDg3l4fXyEg3uEfYmEh3yCf4Z2gH2BgoZ/g3p2hXuIhIOCfYKBfXd8hIeDdYSFfHSDg3R+d4eBeY98gXp1dH59fHyBhXl4hG+Aen2De4OCgIGKhXmFgnuHfH98hIl6fIZ0gIB2homJgHuFf4OKhYZ8hHqFgoB9jYeGgX57iYGCfIV6f4aBfnqAhoV9e4KBgYmDgH55g4Z8hoCDhIR8gIOHfniChIB5hXl/gIV4f4l+g3V5hn5/f45/fHmAgIB5gIR8fYiGeoKBdXZ+eIB+gneDenl+fIGBgIeEf4CCjIJ3eYKCiX13gHh9eIeChX6FdYGFfYSFhn6EhYCGf4h5e4OLfYl9gIN3fYR8",
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

      console.log("User update successful:", updateResponse.data);

      res.status(200).json({
        data: {
          success: true,
          message: "Photo uploaded and face updated successfully",
          data: updateResponse.data,
          employeeId: req.body.employeeId,
        },
      });
    } catch (updateError) {
      console.error("User update failed:", updateError.message);
      if (updateError.response) {
        console.error("Update error details:", updateError.response);
      }

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
    console.error("Upload photo error:", error.message);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    res.status(500).json({
      success: false,
      message: "Failed to upload photo",
      error: error.message,
      details: error.response?.data || null,
    });
  }
};

module.exports = { uploadPhoto };
