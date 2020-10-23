//you are here : vinted/middlewares/isAuthenticate
//BONUS check if offers author has an account
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Wrong user." });
    } else {
      req.user = user;
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
module.exports = isAuthenticated;
