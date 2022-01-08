const express = require("express");
const { sendMail } = require("../public/js/mail");
const { validateEmail } = require("../public/js/utils");

const User = require("./../models/user");

const title = "support";

const router = express.Router();

router.use(express.json());
router.use("./public/js/mail", sendMail);
router.use("./public/js/utils", validateEmail);

router.post("/", async (req, res) => {
  if (req.session.authenticated) {
    try {
      const message = req.body.data.toString();
      const currentDate = new Date();

      const { email, username } = await User.findOne({
        username: req.session.user.username,
      });

      mailOptions = {
        to: "ketakinderemd@gmail.com",
        from: email,
        subject: "Support email",
        html: `<h1>The user ${username} is requesting support</h1
        <p>Message: ${message}</p>
        <p>${currentDate}</p>`,
      };

      sendMail(mailOptions);

      res.status(200).json({ msg: "Success" });
    } catch (e) {
      console.log(e.message);
      res
        .status(500)
        .json({ msg: "There was an error processing your request" });
    }
  } else {
    res.status(403).json({ msg: "Not authenticated" });
  }
});

module.exports = router;
