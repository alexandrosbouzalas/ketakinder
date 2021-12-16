const express = require("express");
const bcrypt = require("bcryptjs");
const sanitize = require("mongo-sanitize");

const router = express.Router();

// Database user model
const User = require("./../models/user");

const title = "login";

router.use(express.json());

router.use(express.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  if (req.session.authenticated) res.redirect("/home");
  else res.render("login/login", { title: title });
});

router.post("/", async (req, res) => {
  req.body = sanitize(req.body);
  const { email, password } = req.body.data;

  try {
    const user = await User.find({ email: email });

    if (email && password) {
      if (req.session.authenticated) {
        res.json(req.session);
      } else {
        if (user) {
          const valid = await bcrypt.compare(password, user[0].password);

          username = user[0].username;

          if (valid) {
            req.session.authenticated = true;
            req.session.user = {
              username,
            };

            res.status(200).json(req.session);
          } else throw new Error("Wrong password");
        } else {
          throw new Error("User not found");
        }
      }
    } else {
      throw new Error("Missing parameters");
    }
  } catch (e) {
    if (
      e.message.includes("Wrong") ||
      e.message.includes("not found") ||
      e.message.includes("undefined")
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
