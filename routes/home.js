const express = require("express");
const router = express.Router();

const { TeamSpeak } = require("ts3-nodejs-library");

const title = "home";

router.use(express.json());

router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("home/home", { title: title });
  } else {
    res.redirect("/");
  }
});

router.post("/", (req, res) => {
  if (req.session.authenticated) {
    TeamSpeak.connect({
      host: "localhost",
      queryport: 10011,
      serverport: 9987,
      username: "serveradmin",
      password: "Test123",
      nickname: "NodeJS Query Framework",
    })
      .then(async (teamspeak) => {
        const clients = await teamspeak.clientList({ clientType: 0 });

        const channels = await teamspeak.channelList();

        res.status(200).json({ clients: clients, channels: channels });
      })
      .catch((e) => {
        console.error(e);
        res
          .status(500)
          .json({ msg: "There was an error processing your request" });
      });
  } else {
    res.status(403).json("Not authenticated");
  }
});

module.exports = router;
