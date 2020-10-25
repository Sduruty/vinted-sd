//---------->you are here : vinted/index
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const isAuthenticated = require("./middlewares/isAuthenticated");
const cors = require("cors");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const app = express();
app.use(cors());
app.use(formidable());
app.use(isAuthenticated);

//***Database connect
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//***cloudinary connect
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//***Import routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.json("Welcome aboard my version of Vinted API.");
});

//***Shit happens
app.all("*", (req, res) => {
  res.status(404).json({
    error: {
      message: "This route doesn't exist. You're inthe middle of nowhere.",
    },
  });
});

//***Start server
app.listen(process.env.PORT, () => {
  console.log(
    `Server started on port : ${process.env.PORT} . To shut it down, press Ctrl+C`
  );
});
