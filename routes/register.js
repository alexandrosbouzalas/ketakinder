const express = require("express");
const sanitize = require("mongo-sanitize");
const bcrypt = require("bcryptjs");
const sjcl = require("sjcl");
const nodemailer = require("nodemailer");

// Database models
const User = require("./../models/user");
const Token = require("./../models/token");

const title = "register";

const router = express.Router();

router.use(express.json());

async function sendMail(token, uId) {
  const user = await User.find({ uId: uId });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "",
      pass: "",
    },
  });

  const mailOptions = {
    to: user[0].email,
    subject: "Verify account",
    html: `<h2 style="padding: 20px 0px 10px 0px;">Hello ${user[0].username},</h2>
    <h3 style="padding-bottom: 20px;">before being able to use your account you need to verify that this is your email address.</h3> 
    <a href="http://localhost:3000/verify/${token}" style="
    display: block;
    width: 115px;
    height: 30px;
    background: #032459;
    padding: 8px;
    text-align: center;
    border-radius: 40px;
    color: white;
    line-height: 30px;
    font-size: 17px;
    ">Verify Now</a>
    <h3 style="padding-top: 30px; padding-bottom: 10px">Kind Regards, Ketakinder<h3>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
  });
}

function generateToken() {
  const seed = (Math.random() + 1).toString(36).substring(7);

  const bitArray = sjcl.hash.sha256.hash(seed);
  const emailToken = sjcl.codec.hex.fromBits(bitArray);

  return emailToken.substring(0, emailToken.length / 2);
}

function createUserToken(uId) {
  const token = new Token({
    token: generateToken(),
    uId: uId,
    expiresAt: new Date(),
  });

  return token;
}

router.get("/", (req, res) => {
  res.render("register/register", { title: title });
});

router.post("/resend", async (req, res) => {
  const uId = req.body.data.uId.toString();
  try {
    const token = await Token.find({ uId: uId });

    if (token[0].token) {
      sendMail(token[0].token, uId);
      res.status(200).json({ msg: "Success" });
    } else {
      const token = createUserToken(uId);
      await token.save();
      sendMail(token[0].token, uId);
      res.status(200).json({ msg: "Success" });
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  req.body = sanitize(req.body);

  const saltRounds = 10;
  const usernameCount = await User.aggregate([{ $count: "username" }]);

  let count = 1;

  if (usernameCount.length != 0) count = usernameCount[0].username;

  const { username, email, password } = req.body.data;

  const uId = Math.floor(count + Math.random() * 9000).toString();

  const user = new User({
    username: username,
    email: email,
    password: await bcrypt.hash(password, saltRounds),
    uId: uId,
  });

  const token = createUserToken(uId);

  try {
    await user.save();
    await token.save();
    sendMail(token.token, uId);

    res.status(200).json({ msg: "Success" });
  } catch (e) {
    var status = res.status(500);
    if (e.message.includes("username"))
      status.json({
        msg: `Username "${username}" already exists`,
      });
    else if (e.message.includes("email"))
      status.json({
        msg: `Email "${email}" already exists`,
      });
    else {
      status.json({ msg: "There was a problem processing your request" });
    }
    console.log(e.message);
  }
});

module.exports = router;
