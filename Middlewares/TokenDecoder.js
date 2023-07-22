const jwt = require("jsonwebtoken");
require("dotenv").config();

function tokenDecoder(req, res, next) {
  const token = req.headers?.authorization?.split(" ")[1];

  const decoded = jwt.verify(token, process.env.secrete);
  if (decoded) {
    req.body.userID = decoded.userID;
    // console.log(decoded);

    next();
  } else {
    res.json({ msg: "You are not authorized. Login again." });
  }
}

module.exports = { tokenDecoder };
