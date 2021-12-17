const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    required: true,
  },
  uId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Token", userSchema);
