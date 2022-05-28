const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const redis = require("redis");
const redisStore = require("connect-redis")(session);
const redisClient = redis.createClient();

const w2gRouter = require("./routes/w2g");
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const homeRouter = require("./routes/home");
const logoutRouter = require("./routes/logout");
const verifyRouter = require("./routes/verify");
const recoverRouter = require("./routes/recover");
const supportRouter = require("./routes/support");
const roomRouter = require("./routes/room");

const Room = require("./models/room");

const port = 3000;

const title = "index";

const app = express();

mongoose.connect("mongodb://localhost:27017/ketakinder");

redisClient.on("error", (err) => {
  console.log("\nCould not establish a connection with redis.\n".toUpperCase());
  throw err;
});

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/img"));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "Fkdj^45ci@Jad", // This is not a password
    cookie: {
      maxAge: 604800000,
    },
    store: new redisStore({
      host: "localhost",
      port: 6379,
      client: redisClient,
      ttl: 260,
    }),
    secure: false, // if true only transmit cookie over https
    httpOnly: false, // if true prevent client side JS
    resave: false,

    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  if (req.session.authenticated) res.redirect("/home");
  else res.render("index/index", { title: title });
});

app.use("/w2g", w2gRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/home", homeRouter);
app.use("/logout", logoutRouter);
app.use("/verify", verifyRouter);
app.use("/recover", recoverRouter);
app.use("/support", supportRouter);
app.use("/room", roomRouter);


async function deleteRoom(socket) {

  const refererUrl = socket.handshake.headers.referer;

  const roomId = refererUrl.substring(refererUrl.length - 6, refererUrl.length) ;

  try {
    const room = await Room.findOne({ roomId: roomId });

    if (room) {
      await room.deleteOne({ roomId: roomId });
      redisClient.del(roomId);
    } else {
      console.log("Room does not exist or has been deleted");
    }
  } catch (e) {
    console.log(e.message);
  }
}

try {

  const server = app.listen(3000)

  const io = require('socket.io')(server);

  app.set('socketio', io);

  io.on('connection', function(socket) {
    var query = socket.handshake.query;
    var roomName = query.roomName;

    if(!roomName || roomName.length != 6) {
        socket.emit('error', "RoomID is Invalid.");
    }

    socket.join(roomName);

    const sessionId = socket.handshake.headers.cookie.substring(16).split('.')[0];

    redisClient.get("sess:" + sessionId, (err, response) => {
      if (err) throw new Error(err);
      else {
        socket.to(roomName).emit('userJoin', JSON.parse(response).user.username);
      }
    });

    socket.on('playVideo', function (args){
      socket.to(roomName).emit('playVideo');
    });
    
    socket.on('pauseVideo', function (args){
      socket.to(roomName).emit('pauseVideo');
    });

    socket.on('videoUrlChange', function (args) {
      socket.to(roomName).emit('videoUrlChange', args);
    })

    socket.on('videoTimeChange', function (args) {
      socket.to(roomName).emit('videoTimeChange', args);
    })

    socket.on('checkClients', function (args) {
      const clients = io.sockets.adapter.rooms.get(roomName);
      
      const [first] = clients; 

      if(clients.size > 1) {
        socket.broadcast.to(first).emit('getVideoTime', args);
      } else if(clients.size == 1) {
        io.sockets.in(roomName).emit('videoUrlChange', {url: args});
      }
    })
    socket.on('videoTime', function (args) {
      socket.to(roomName).emit('videoUrlAndTimeChange', args);
    })

    socket.on('disconnect', function () {

      redisClient.get("sess:" + sessionId, (err, response) => {
        if (err) throw new Error(err);
        else {
          socket.to(roomName).emit('userExit', JSON.parse(response).user.username);
        }
      });
  
      // Get the object containing the users in a room
      let clients = io.sockets.adapter.rooms.get(roomName);

      // If the last user disconnects from the room, delete it.
      if(!clients) {
        setTimeout(() => {
          
          clients = io.sockets.adapter.rooms.get(roomName);

          // Checking again after 30 seconds before deleting, so the room is not deleted when the page is refreshed
          if(!clients) {
            deleteRoom(socket);
            console.log('Room deleted')
          }
        }, 30000)
      }
    });
  });

  console.info(`Listening on: https://ketakinder.tk`);

} catch (e) {
  
  console.log("There was an error starting the app");
  console.log(e.message);
}
