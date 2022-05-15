const express = require("express");
const router = express.Router();

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
      res.render("room/room", { title: "room" });
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


module.exports = router;
