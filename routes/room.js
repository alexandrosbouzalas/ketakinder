const express = require("express");
const router = express.Router();

const title = "room";

router.use(express.json());

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("room/room", { title: title });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
