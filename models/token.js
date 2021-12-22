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
    createdAt: {
      type: Date,
      required: true,
      expires: "6h",
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);
