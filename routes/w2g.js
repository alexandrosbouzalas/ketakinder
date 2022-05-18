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

router.get("/room", (req, res) => {
  if (req.session.authenticated) {
    res.render("room/room", { title: title });
  } else {
    res.redirect("/");
  }
  
});

router.get("/room/:roomId", async (req, res) => {
  if (req.session.authenticated) {
    let room = await Room.findOne({ roomId: req.params.roomId });

    if(room) {
      redisClient.get(room.roomId, (err, response) => {
        if (err) throw new Error(err);
        else if (response) {
          
  
          res.render("room/room", { url: response });
          
          const io = req.app.get('socketio');

          io.sockets.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });
  
        } else {
          console.log("No data received");
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

router.post("/room/:roomId", async (req, res) => {
  if (req.session.authenticated) {
    if(req.body.data.roomId && req.body.data.url) {
      redisClient.set(req.body.data.roomId, req.body.data.url);
    }

    


    // Play/Pause/Stop youtube iframe code sample
    //https://codepen.io/briangelhaus/pen/meeLRO



  } else {
    res.redirect("/");
  }
});



module.exports = router;
