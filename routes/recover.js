const express = require("express");
const sanitize = require("mongo-sanitize");
const redis = require("redis");
const redisClient = redis.createClient();
const { sendMail } = require("../public/js/mail");
const { generateToken } = require("../public/js/utils");
const { addTime } = require("../public/js/utils");
const { bcryptHash } = require("../public/js/utils");
const { validatePassword } = require("../public/js/utils");
const { validateEmail } = require("../public/js/utils");

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
router.use("./public/js/utils", validatePassword);
router.use("./public/js/utils", validateEmail);

router.use(function (req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});

function createPasswordToken(uId) {
  const token = new Token({
    token: generateToken(),
    for: "password",
    uId: uId,
    expirationDate: addTime(new Date(), 30),
  });

  return token;
}

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/");
  } else {
    res.render("recover/recover", { title: title });
  }
});

router.post("/", async (req, res) => {
  try {
    if (req.session.authenticated) {
      res.redirect("/");
    } else {
      try {
        req.body = sanitize(req.body);

        const { email } = req.body.data;

        if (!validateEmail(email.toString())) throw new Error("Invalid email");

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
          <a href="https://ketakinder.tk/recover/${token.token}" style="
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
          <h3 style="padding-top: 30px; padding-bottom: 10px">Kind Regards, Ketakinder</h3>`,
          };
        } else {
          mailOptions = {
            to: email,
            subject: "Recover your password",
            html: `<h3"> We received an account recovery request for ${email}, but that email does not exist in our records.
          If you meant to sign up for Ketakinder, you can <a href="https://ketakinder.tk/register">sign up here</a>.</h3> 
          <h3 style="padding-top: 20px; padding-bottom: 10px">Kind Regards, Ketakinder</h3>`,
          };
        }

        sendMail(mailOptions);

        res.status(200).json({ msg: "Success", email: email });
      } catch (e) {
        console.log(e);
        res.status(500).json("There was an error processing your request");
      }
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).json(e.message);
  }
});

router.get("/:token", async (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/");
  } else {
    try {
      const token = await Token.findOne({ token: req.params.token });

      if (token && token.for == "password") {
        res.render("recover/recoveryform", { title: title });
      } else {
        const errorText = "The specified token in not valid or has expired.";
        res.render("verify/verify", { title: "verify", text: errorText });
        throw new Error("Invalid/expired token");
      }
    } catch (e) {
      console.log(e.message);
    }
  }
});

router.post("/:token", async (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/");
  } else {
    try {
      req.body = sanitize(req.body);
      const { password } = req.body.data;

      if (!validatePassword(password.toString()))
        throw new Error("Invalid password");

      const token = await Token.findOne({ token: req.params.token });

      if (token && token.for == "password") {
        await User.updateOne(
          { uId: token.uId },
          { $set: { password: await bcryptHash(password) } }
        );
        const { username } = await User.findOne({ uId: token.uId });

        await Token.deleteOne({ token: token.token });

        redisClient.keys("*", (err, redisKeys) => {
          if (!err) {
            for (let i = 0; i < redisKeys.length; i++) {
              redisClient.get(redisKeys[i], (err, valid) => {
                if (!err) {
                  if (valid.toString().includes(username))
                    redisClient.del(redisKeys[i], (err, valid) => {
                      if (err) console.log(err);
                    });
                }
              });
            }
          } else throw new Error(err);
        });

        res.status(200).json({ msg: "Success" });
      } else {
        res.status(500).json("Invalid/Expired token");
      }
    } catch (e) {
      console.log(e.message);
      res.status(500).json("There was an error processing your request");
    }
  }
});

module.exports = router;
