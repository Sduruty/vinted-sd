//---------->you are here : vinted/index
const { json } = require("express"); //added with brice's sent correction
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//****import routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

//****shit happens
app.all("*", (req, res) => {
  res.status(404).json({
    message: "This route doesn't exist. You're in the middle of nowhere.",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server started. To shut it down, press Ctrl+C.");
});
