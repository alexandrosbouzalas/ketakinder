const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
    },
    hostUId: {
      type: String,
      required: true,
    },
    /* expirationDate: {
      type: Date,
      expires: 0,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    }, */
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
