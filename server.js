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

try {
  app.listen(3000);
  console.info(`Listening on: https://ketakinder.tk`);
} catch (e) {
  console.log("There was an error starting the app");
  console.log(e.message);
}

app.use("/w2g", w2gRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/home", homeRouter);
app.use("/logout", logoutRouter);
app.use("/verify", verifyRouter);
app.use("/recover", recoverRouter);
app.use("/support", supportRouter);
