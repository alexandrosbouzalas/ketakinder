const express = require("express");
const sanitize = require("mongo-sanitize");
const { sendMail } = require("../public/js/mail");
const { generateToken } = require("../public/js/utils");
const { addTime } = require("../public/js/utils");
const { bcryptHash } = require("../public/js/utils");

const User = require("../models/user");
const Token = require("../models/token");

const title = "recover";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use("./public/js/mail", sendMail);
router.use("./public/js/utils", generateToken);
router.use("./public/js/utils", addTime);
router.use("./public/js/utils", bcryptHash);

function createPasswordToken(uId) {
  const token = new Token({
    token: generateToken(),
    uId: uId,
    expirationDate: addTime(new Date(), 30),
  });

  return token;
}

router.get("/", (req, res) => {
  res.render("recover/recover", { title: title });
});

router.post("/", async (req, res) => {
  req.body = sanitize(req.body);
  const { email } = req.body.data;

  try {
    const user = await User.findOne({ email: email });
    let mailOptions;

    if (user) {
      const uId = user.uId;

      const token = createPasswordToken(uId);

      await token.save();

      mailOptions = {
        to: user.email,
        subject: "Recover your password",
        html: `<h2 style="padding: 20px 0px 10px 0px;">Hello ${user.username},</h2>
      <h3 style="padding-bottom: 20px;">follow the link bellow to recover your password.</h3> 
      <a href="http://localhost:3000/recover/${token.token}" style="
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
      ">Recover Now</a>
      <h3 style="padding-top: 30px; padding-bottom: 10px">Kind Regards, Ketakinder<h3>`,
      };
    } else {
      mailOptions = {
        to: email,
        subject: "Recover your password",
        html: ` 
      <p">
      We received an account recovery request for ${email}, but that email does not exist in our records.
      If you meant to sign up for Ketakinder, you can <a href="http://localhost:3000/register">sign up here</a>.</p> 
      <p style="padding-top: 20px; padding-bottom: 10px">Kind Regards, Ketakinder<p>`,
      };
    }

    sendMail(mailOptions);

    res.status(200).json({ msg: "Success", email: email });
  } catch (e) {
    res.status(500).json({ msg: "There was an error processing your request" });
    console.log(e);
  }
});

router.get("/:token", async (req, res) => {
  try {
    const token = await Token.findOne({ token: req.params.token });

    if (token) {
      res.render("recover/recoveryform", { title: title });
    } else {
      const errorText = "The specified token in not valid or has expired.";
      res.render("verify/verify", { title: "verify", text: errorText });
      throw new Error("Invalid/expired token");
    }
  } catch (e) {
    console.log(e.message);
  }
});

router.post("/:token", async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const { password } = req.body.data;

    const token = await Token.findOne({ token: req.params.token });

    if (token) {
      await User.updateOne(
        { uId: token.uId },
        { $set: { password: await bcryptHash(password) } }
      );

      await Token.deleteOne({ token: token.token });

      res.status(200).json({ msg: "Success" });
    } else {
      res.status(500).json("Invalid/Expired token");
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = router;
