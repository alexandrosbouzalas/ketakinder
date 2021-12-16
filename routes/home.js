const express = require("express");
const router = express.Router();

const title = "home";

router.use(express.json());

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("home/home", { title: title });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
