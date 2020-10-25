//---------->you are here : vinted/routes/user
const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

//***import models
const User = require("../models/User");
const Offer = require("../models/Offer");

//***user sign up
router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, phone, password } = req.fields;
    //*** email already in DB?
    const user = await User.findOne({ email: email });
    if (user) {
      //***if yes
      res.status(400).json({
        message: "Provided email already has an account.",
      });
    } else {
      if (email && username && password) {
        //***encrypt password
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);
        //***generate new user
        const newUser = new User({
          email,
          account: {
            username,
            phone,
          },
          token,
          hash,
          salt,
        });
        //***save new user in DB
        await newUser.save();
        res.status(200).json({
          //***answer back
          _id: newUser._id,
          email: newUser.email,
          account: newUser.account,
          token: newUser.token,
        });
      } else {
        res.status(400).json({
          message: "Missing parameters. Please fill the fields correctly",
        });
      }
    } //***shit happens
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
//***user log in
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    //***who wants to log in?
    const user = await User.findOne({ email: email });
    console.log(user);
    //***if user is in DB
    if (user) {
      //***did user provided correct password ?
      const testHash = SHA256(password + user.salt).toString(encBase64);
      if (testHash === user.hash) {
        //***if yes
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
        //***if not
      } else {
        res.status(401).json({
          message: "Unauthorized access. Wrong password provided",
        });
      }
    } else {
      //***if user isn't in DB
      res.status(400).json({
        message: "User not found",
      });
    } //***shit happens
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
