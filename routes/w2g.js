const express = require("express");
const router = express.Router();

const { validateInputUrl } = require("../public/js/utils");
const { generateRoomToken } = require("../public/js/utils");
const Room = require("../models/room");


const title = "w2g";

router.use(express.json());
router.use("./public/js/utils", validateInputUrl);
router.use("./public/js/utils", generateRoomToken);


function createRoom(roomId) {
  const room = new Room({
    roomId: roomId,
    hostUId: 1000,
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
      res.render("room/room", { title: "room", url: `https://youtube.com/embed/fjZAgoxFKiQ`});
    } else {
      
      const errorText = "The room link is invalid.";
      res.render("verify/verify", { title: "verify", text: errorText });

    }
  } else {
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  if (req.session.authenticated) {
    const inputUrl = req.body.data;
    
    if(validateInputUrl(inputUrl)) {

      // The url that is inputed in the room creation field is temporariliy stored in this variable and passed along
      // with the room redirection

      roomRedirectionLink = inputUrl.split("=");

      let roomId = generateRoomToken();

      let room = await Room.findOne({ roomId: roomId });

      while(room) {
        let roomId = generateRoomToken();
        room = await Room.findOne({ roomId: roomId });
      }
      

      try {
        const room = createRoom(roomId);

        try {
          await room.save();
          console.log("Room created successfully")
          res.send(roomId).status(200);
        } catch {
          console.log("Error creating room");
        }

      }
      catch {
        console.log("There was an error creating the room");
      }


    } else {
      res.send("Url is Invalid!").status(200);
    }
    
  } else {
    res.send("Error").status(403);
  }
})


module.exports = router;
