const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    email: { type: String, required: true },
    image: { type: String, default: "" },
    password: { type: String, default: "" },
  },
  { versionKey: false }
);

const UserModal = new mongoose.model("user", userSchema);

module.exports = { UserModal };
