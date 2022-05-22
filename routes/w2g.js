const express = require("express");
const router = express.Router();

const redis = require("redis");
const redisPort = process.env.port || 6379;
const redisClient = redis.createClient(redisPort);

const { validateInputUrl } = require("../public/js/utils");
const { generateRoomToken } = require("../public/js/utils");
const Room = require("../models/room");
const User = require("../models/user");


const title = "w2g";

router.use(express.json());
router.use("./public/js/utils", validateInputUrl);
router.use("./public/js/utils", generateRoomToken);

function validateInputString(input) {
  const reInputString = /^(https:\/\/([w]{3}\.)?youtu(be)?\.(com|de|be)\/(watch\?v=)?)?[a-zA-Z0-9_-]{11}$/;

  if (reInputString.test(input) ) {
      return true;
  } else {
      return false;
  }
}

function createRoom(roomId, hostUId) {
  const room = new Room({
    roomId: roomId,
    hostUId: hostUId,
  });

  return room;
}


router.get("/", (req, res) => {
  if (req.session.authenticated) {
    res.render("w2g/w2g", { title: title });
  } else {
    res.redirect("/");
  }
});


router.post("/", async (req, res) => {
  if (req.session.authenticated) {

      const user = await User.findOne({ username: req.session.user.username});

      const hostUId = user.uId;

      let roomId = generateRoomToken();

      let room = await Room.findOne({ roomId: roomId });

      while(room) {
        let roomId = generateRoomToken();
        room = await Room.findOne({ roomId: roomId });
      }  

      try {
        const room = createRoom(roomId, hostUId);

        try {
          await room.save();
          console.log("Room created successfully")
          res.send(roomId).status(200);
        } catch {
          console.log("Error creating room");
        }

      }
      catch(e) {
        console.log(`There was an error creating the room: ${e.message}`);
      }
  } else {
    res.send("Not authenticated").status(403);
  }
})


router.get("/room", (req, res) => {
  res.redirect("/w2g");
});

router.get("/room/:roomId", async (req, res) => {
  if (req.session.authenticated) {

    let room = await Room.findOne({ roomId: req.params.roomId });

    if(room) {
      res.render("room/room")
    } else {
      const errorText = "The room link is invalid";
      res.render("verify/verify", { text: errorText });
    }
  } else {
    res.redirect("/");
  }
});

router.post("/room/:roomId", async (req, res) => {
  if (req.session.authenticated) {

    if(req.body.data.action === "fetch") {
      redisClient.get(req.body.data.roomId, (err, response) => {
        if (err) throw new Error(err);
        else if (response) {
          res.send(response).status(200);
        } else {
          console.log("No data found for room " + req.body.data.roomId);
        }
      });
    } else if(req.body.data.action === "update") {
      if((req.body.data.roomId && req.body.data.url) && validateInputString(req.body.data.url)) {
        try {
          redisClient.set(req.body.data.roomId, req.body.data.url);
        } catch(e) {
          throw new Error("Can't update url field: " + e.message);
        }
      }
    }


  } else {
    res.redirect("/");
  }
});



module.exports = router;
