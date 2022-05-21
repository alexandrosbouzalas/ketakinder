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

async function deleteRoom(socket) {

  const refererUrl = socket.handshake.headers.referer;

  const roomId = refererUrl.substring(refererUrl.length - 6, refererUrl.length) ;

  try {
    const room = await Room.findOne({ roomId: roomId });

    if (room) {
      await room.deleteOne({ roomId: roomId });

    } else {
      console.log("Room does not exist or has been deleted");
    }
  } catch (e) {
    console.log(e.message);
  }
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

    const io = req.app.get('socketio');

    let room = await Room.findOne({ roomId: req.params.roomId });

    if(room) {
      redisClient.get(room.roomId, (err, response) => {
        if (err) throw new Error(err);
        else if (response) {
          
          res.render("room/room", { url: response });
  
        } else {
          res.render("room/room", { url: "" });
          
        }
      });
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
    /* if((req.body.data.roomId && req.body.data.url) && validateInputString(req.body.data.url)) {

      redisClient.set(req.body.data.roomId, req.body.data.url);
    } */


    if(req.body.data.roomId && req.body.data.url) {

      redisClient.set(req.body.data.roomId, req.body.data.url);
    }

  } else {
    res.redirect("/");
  }
});



module.exports = router;
