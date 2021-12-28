const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
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
    expirationDate: {
      type: Date,
      expires: 0,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);
