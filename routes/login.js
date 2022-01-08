const express = require("express");
const sanitize = require("mongo-sanitize");
const { bcryptCompare } = require("../public/js/utils");
const { validatePassword } = require("../public/js/utils");
const { validateEmail } = require("../public/js/utils");

const router = express.Router();

const User = require("./../models/user");

const title = "login";

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use("./public/js/utils", bcryptCompare);
router.use("./public/js/utils", validatePassword);
router.use("./public/js/utils", validateEmail);

router.use(function (req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});

router.get("/", (req, res) => {
  if (req.session.authenticated) res.redirect("/home");
  else res.render("login/login", { title: title });
});

router.post("/", async (req, res) => {
  const { email, password } = req.body.data;

  try {
    const user = await User.findOne({ email: email });

    if (!validateEmail(email.toString())) throw new Error("Invalid email");
    if (!validatePassword(password.toString()))
      throw new Error("Invalid password");

    if (email && password) {
      if (req.session.authenticated) {
        res.json(req.session);
      } else {
        if (user) {
          const active = user.active;
          const valid = await bcryptCompare(password, user);
          const username = user.username;

          if (valid) {
            if (active) {
              req.session.authenticated = true;
              req.session.user = {
                username,
              };

              res.status(200).json(req.session);
            } else {
              res.json({
                msg: "This account has not yet been activated",
              });
            }
          } else throw new Error("Wrong password");
        } else {
          throw new Error("User not found");
        }
      }
    } else {
      throw new Error("Missing parameters");
    }
  } catch (e) {
    console.log(e.message);
    if (
      e.message.includes("Wrong") ||
      e.message.includes("not found") ||
      e.message.includes("undefined") ||
      e.message.includes("Invalid")
    ) {
      res.status(403).json({
        msg: "The email or password is incorrect.",
      });
    } else {
      res.status(500).json({
        msg: "There was a problem processing your request",
      });
    }
    console.log(e.message);
  }
});

module.exports = router;
