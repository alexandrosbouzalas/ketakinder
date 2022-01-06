const express = require("express");

const router = express.Router();

const Token = require("../models/token");
const User = require("../models/user");

const title = "verify";

router.use(express.json());

router.get("/:token", async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.params.token });

    if (token && token.for == "account") {
      const successText = "Thank you for verifying you account";
      await User.updateOne({ uId: token.uId }, { $set: { active: true } });
      await Token.deleteOne({ token: req.params.token });
      res.render("verify/verify", { title: title, text: successText });
    } else {
      const errorText = "The specified token in not valid or has expired.";
      res.render("verify/verify", { title: title, text: errorText });
      throw new Error("Invalid/expired token");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = router;
