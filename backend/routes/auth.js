const express = require("express");
require("dotenv").config();

const router = express.Router();

const username = process.env.HR_USERNAME;
const password = process.env.HR_PASSWORD;


if( !username || !password) {
  throw new Error("HR_USERNAME and HR_PASSWORD must to be set in environment variables");
}

router.post("/login", (req, res) => {
  const { username: inputUsername, password: inputPassword } = req.body;
  

  //Basic input validation
  if (!inputUsername || !inputPassword) {
    return res
    .status(400)
    .json({ message: "Username and password are required" });
  }

  if (inputUsername !== username || inputPassword !== password) {
    return res
    .status(401)
    .json({ message: "Invalid credentials, unauthorised" });
  }

  // issue a data according to the requirement

  res
  .status(200)
.json({ message: "Login successful"}, {data:{username:inputUsername}} )
  
  .end();
});

module.exports = router;
