const loginToBioStar = require("../services/Loginservices");
const axios = require("axios");

const addVisitor = async ( req, res) => {
    const {fullName, email, phone, address, department, title, userGroup} = req.body 
    console.log(fullName, email, phone, address, department, title, userGroup)

    return res.
    status(200).
    send({message: "visitor added successfully"})


}

module.exports = {addVisitor}