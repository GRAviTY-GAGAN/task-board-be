const express = require("express");
const { UserModal } = require("../Models/user.Model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.secrete);
    // console.log(decoded, "TOKEN");

    const findUser = await UserModal.findOne({ _id: decoded.userID });

    if (findUser) {
      res.json({ msg: "success", user: findUser });
    } else {
      res.json({ msg: "Something went wrong. Login again." });
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

userRouter.post("/gAuth", async (req, res) => {
  const { name: firstName, email, picture: image } = req.body;
  // console.log(req.body, firstName);
  try {
    const findUser = await UserModal.findOne({ email });

    let user;

    if (!findUser) {
      user = new UserModal({ firstName, email, image });
      await user.save();
    } else {
      user = await UserModal.findOneAndUpdate({ email }, { image });
    }

    const token = jwt.sign(
      {
        userID: user?._id || findUser?._id,
        userEmail: email,
        userName: firstName,
      },
      process.env.secrete
    );
    res.json({
      msg: "User Logged In.",
      already_registered: findUser ? "Old User" : "New User",
      user: user || findUser,
      token,
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

userRouter.post("/signup", async (req, res) => {
  const { firstName, email, lastName, password } = req.body;
  try {
    const findUser = await UserModal.findOne({ email });

    if (!findUser && !password) {
      const user = new UserModal({ firstName, email, lastName, password });
      await user.save();

      res.json({
        msg: "success",
        already_registered: findUser ? "Old User" : "New User",
        user: user || findUser,
      });
    } else if (!findUser) {
      const hash = bcrypt.hashSync(password, 5);

      const user = new UserModal({
        firstName,
        email,
        lastName,
        password: hash,
      });
      await user.save();
      res.json({
        msg: "success",
        already_registered: findUser ? "Old User" : "New User",
        user: user || findUser,
      });
    } else {
      res.json({ msg: "User Already Exists." });
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await UserModal.findOne({ email });

    if (findUser && findUser.password != "") {
      const passwordMatched = bcrypt.compareSync(password, findUser.password);

      if (passwordMatched) {
        const token = jwt.sign(
          {
            userID: findUser._id,
            userEmail: email,
            userName: findUser.firstName,
          },
          process.env.secrete
        );
        res.json({
          msg: "success",
          user: findUser,
          token,
        });
      } else {
        res.json({ msg: "Invalid Credentials." });
      }
    } else if (findUser && findUser.password === "") {
      const hash = bcrypt.hashSync(password, 5);

      const updateUser = await UserModal.findOneAndUpdate(
        { email },
        { password: hash }
      );

      const token = jwt.sign(
        {
          userID: findUser._id,
          userEmail: email,
          userName: findUser.firstName,
        },
        process.env.secrete
      );

      res.json({
        msg: "success",
        user: findUser,
        token,
      });
    } else {
      res.json({ msg: "User dosent Exists. Signup first and try again." });
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

module.exports = { userRouter };
