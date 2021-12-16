const express = require("express");
const sjcl = require("sjcl");

const router = express.Router();

const Token = require("./../models/token");
const User = require("./../models/user");

router.use(express.json());

router.get("/verify/:token", (req, res) => {
  const token = req.params.token;
  console.log(token);

  try {
    const { uId } = Token.find({ token: token });
    if (uId.token) {
    }
  } catch (e) {
    res.send("Token does not exist");
    throw Error(e.message);
  }
});

router.get("/", (req, res) => {});

module.exports = router;
