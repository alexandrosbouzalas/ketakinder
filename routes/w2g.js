const express = require("express");
const router = express.Router();

const { validateEmail } = require("../public/js/utils");

const title = "w2g";

router.use(express.json());
router.use("./public/js/utils", validateEmail);

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("w2g/w2g", { title: title });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
