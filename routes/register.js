const express = require("express");
const sanitize = require("mongo-sanitize");
const { sendMail } = require("../public/js/mail");
const { generateToken } = require("../public/js/utils");
const { addTime } = require("../public/js/utils");
const { bcryptHash } = require("../public/js/utils");
const { validatePassword } = require("../public/js/utils");
const { validateEmail } = require("../public/js/utils");
const { validateUsername } = require("../public/js/utils");

// Database models
const User = require("./../models/user");
const Token = require("./../models/token");

const title = "register";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use("./public/js/mail", sendMail);
router.use("./public/js/utils", generateToken);
router.use("./public/js/utils", addTime);
router.use("./public/js/utils", bcryptHash);
router.use("./public/js/utils", validatePassword);
router.use("./public/js/utils", validateEmail);
router.use("./public/js/utils", validateUsername);

router.use(function (req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});

function createEmailToken(uId) {
  const token = new Token({
    token: generateToken(),
    uId: uId,
    expirationDate: addTime(new Date(), 360),
  });

  return token;
}

router.get("/", (req, res) => {
  res.render("register/register", { title: title });
});

router.post("/", async (req, res) => {
  req.body = sanitize(req.body);

  const { username, email, password } = req.body.data;

  if (!validatePassword(password.toString()))
    throw new Error("Invalid password");
  if (!validateEmail(email.toString())) throw new Error("Invalid email");
  if (!validateUsername(username.toString()))
    throw new Error("Invalid username");

  const usernameCount = await User.aggregate([{ $count: "username" }]);

  let count = 1;

  if (usernameCount.length != 0) count = usernameCount[0].username;

  const uId = Math.floor(count + Math.random() * 9000).toString();

  const user = new User({
    username: username,
    email: email,
    password: await bcryptHash(password),
    uId: uId,
  });

  try {
    await user.save();

    const token = createEmailToken(user.uId);

    await token.save();

    const mailOptions = {
      to: user.email,
      subject: "Verify your account",
      html: `<h2 style="padding: 20px 0px 10px 0px;">Hello ${user.username},</h2>
      <h3 style="padding-bottom: 20px;">before being able to use your account you need to verify that this is your email address.</h3> 
      <a href="http://localhost:3000/verify/${token.token}" style="
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

    sendMail(mailOptions);

    res.status(200).json({ msg: "Success", email: email });
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

router.post("/resend", async (req, res) => {
  const email = req.body.data.email.toString();
  try {
    const user = await User.findOne({ email: email });
    const token = await Token.findOne({ uId: user.uId });

    const mailOptions = {
      to: user.email,
      subject: "Verify your account",
      html: `<h2 style="padding: 20px 0px 10px 0px;">Hello ${user.username},</h2>
      <h3 style="padding-bottom: 20px;">before being able to use your account you need to verify that this is your email address.</h3> 
      <a href="http://localhost:3000/verify/${token.token}" style="
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

    if (token.token) {
      sendMail(mailOptions);
      res.status(200).json({ msg: "Success" });
    } else {
      const token = createEmailToken(token.uId);
      await token.save();
      sendMail(mailOptions);
      res.status(200).json({ msg: "Success" });
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
