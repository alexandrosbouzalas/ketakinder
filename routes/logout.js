const express = require("express");

const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    req.session.destroy((err) => {
      if (!err) {
        res.redirect("/");
      } else {
        console.log(err);
        res.redirect("/");
      }
    });
  }
});

module.exports = router;
