const express = require("express");

const title = "logout";

const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    req.session.destroy((err) => {
      if (err) {
        return console.log(err);
      }
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
