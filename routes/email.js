const express = require("express");

const router = express.Router();

const Token = require("./../models/token");
const User = require("./../models/user");

router.use(express.json());

router.get("/verify/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const uId = await Token.find({ token: token });

    if (uId[0].token) {
      await User.updateOne({ uId: uId[0].uId }, { $set: { active: true } });
    }
  } catch (e) {
    res.send("Token does not exist");
    throw Error(e.message);
  }
});

router.get("/", (req, res) => {});

module.exports = router;
