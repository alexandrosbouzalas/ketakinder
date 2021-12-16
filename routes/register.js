const express = require("express");
const sanitize = require("mongo-sanitize");
const bcrypt = require("bcryptjs");
const swal = require("sweetalert2");

// Database models
const User = require("./../models/user");
const Token = require("./../models/token");

const title = "register";

const router = express.Router();

router.use(express.json());

function generateToken() {
  const seed = (Math.random() + 1).toString(36).substring(7);

  const bitArray = sjcl.hash.sha256.hash(seed);
  const emailToken = sjcl.codec.hex.fromBits(bitArray);

  return emailToken.substring(0, verifyEmailId.length / 2);
}

router.get("/", (req, res) => {
  res.render("register/register", { title: title });
});

router.post("/", async (req, res) => {
  req.body = sanitize(req.body);

  const saltRounds = 10;
  const { usernameCount } = await User.aggregate({ $count: "username" });

  const { username, email, password } = req.body.data;
  const uId = UserMath.floor(usernameCount.username + Math.random() * 900);

  const user = new User({
    username: username,
    email: email,
    password: await bcrypt.hash(password, saltRounds),
    uId: uId,
  });

  const token = new Token({
    token: generateToken(),
    uId: uId,
  });

  // Here we will send the email to the user with the token we generated

  try {
    await user.save();
    await token.save();

    res.status(200).json({ msg: "Success" });
  } catch (e) {
    var status = res.status(500);
    if (e.message.includes("username"))
      status.json({
        msg: `Username "${req.body.data[0].value}" already exists`,
      });
    else if (e.message.includes("email"))
      status.json({
        msg: `Username "${req.body.data[1].value}" already exists`,
      });
    else {
      status.json({ msg: "There was a problem processing your request" });
    }
    console.log(e.message);
  }
});

module.exports = router;
