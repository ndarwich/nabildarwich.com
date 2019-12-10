const express = require("express");
const crypto = require("crypto");
const path = require("path");
const router = express.Router();
var server = require("http").Server(router);
var io = require("socket.io").listen(server);

const uuid = require("uuid/v4");
// var registeredUsers = {};

let cookieParser = require("cookie-parser");
let session = require("express-session");

router.use(session({
  genid: (req) => {
    console.log("Inside the session middleware")
    console.log(req.sessionID)
    return uuid()
  },
  secret: "key cat",
  resave: false,
  saveUninitialized: true
}));

//pente router
router.get("/", (req, res) => {
   res.cookie("cart", "test", {maxAge: 900000, httpOnly: true});
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/pente.html", { root: __dirname + "/../public" });
});

router.get("/createAccount", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/createAccount.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/joinGame", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect("/pente");
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/joinGame.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/game", (req, res) => {
  console.log("USERNAME IS " + req.session.username);
  console.log("ID IS " + req.sessionID);
  res.setHeader("Content-Type", "text/html");
  //res.send(req.session.username);
  //res.cookie("pente-username", req.session.username, { maxAge: 900000, httpOnly: false});
  res.sendFile("/game.html", { root: __dirname + "/../public/pages/pente" });
});

//helper route to retrieve the user's Pente username
router.get("/getPenteUsername", (req, res) => {
if (req.session.username == null) {
  res.status(404).send({ error: "Not Logged In, Please log in" });
    return;
  }
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(req.session.username);
});

//helper route to generate a unique game ID to the user
router.get("/getUniqueGameId", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  if (req.session.username == null) {
    res.status(404).send({ error: "Not Logged In, Please log in" });
    return;
  }
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let gameId = "";
  for (let i = 0; i < 5; i++ ) {
      gameId += chars.charAt(Math.floor(Math.random()*chars.length));
  }
  res.status(200).send(gameId);
});

//helper route to retrieve status of a game if we are able to join it
router.post("/getGameStatus", (req, res) => {
  if (req.session.username == null) {
    res.status(404).send({ error: "Not Logged In, Please log in" });
      return;
  }
  let activeGamesToPlayers = req.app.activeGamesToPlayers;
  console.info("ACTIVE GAMES TO PLAYERS");
  console.info(activeGamesToPlayers);
  res.setHeader("Content-Type", "text/html");
  res.status(200);
  let gameId = req.body.gameId;
  if (gameId in activeGamesToPlayers) {
    let activeGame = activeGamesToPlayers[gameId];
    if (activeGame["BLACK"] == null && activeGame["WHITE"] != req.session.username) { //if second player hasn't joined yet
        console.info("Game with id " + gameId + " Found, joining as BLACK");
        res.status(200).send("Joining game");
    } else if (activeGame["WHITE"] == req.session.username && activeGame["BLACK"] != null) { //if first player disconnected and wants to reconnect
        console.info("Game with id " + gameId + " found, rejoining as WHITE");
        res.status(200).send("Joining game");
    } else if (activeGame["BLACK"] == req.session.username && activeGame["WHITE"] != null) { //if first player disconnected and wants to reconnect
        console.info("Game with id " + gameId + " found, rejoining as WHITE");
        res.status(200).send("Joining game");
    } else if (activeGame["WHITE"] != null && activeGame["BLACK"] != null) {
      res.status(500).send("Game with id " + gameId + " Full");
    } else if (activeGame["WHITE"] == req.session.username && activeGame["BLACK"] == null) {
      res.status(500).send("Cannot join game " + gameId + " as you are the host");
    } else {
      res.status(500).send("No Game with id " + gameId + " Found");
    }
  } else {
    res.send("No Game with id " + gameId + " Found");
  }
});

router.get("/home", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect("/pente");
  }
  console.log("USERNAME IS " + req.session.username);
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/home.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/leaderboards", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect("/pente");
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/leaderboards.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/completedGames", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect("/pente");
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/completedGames.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/gameHistory", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect("/pente");
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/gameHistory.html", { root: __dirname + "/../public/pages/pente" });
});

router.post("/getTable", function(req, res) {
  let result = "<table style='width:100%'>";
  result+="<th>Username</th>";
  result+="<th>Win/Loss/Tie Ratio</th>";
  var registeredUsers = req.app.registeredUsers;
  for (user in registeredUsers){
    result += "<tr><td>" + user + "</td><td>" + registeredUsers[user].wins + "/" + registeredUsers[user].losses + "/" + registeredUsers[user].ties + "</td></tr>";
  }
  result += "</table>";
  res.send(result);
});

router.get("/getCompletedGames", function(req, res) {
  res.status(200).send(req.app.completedGames);
});

router.post("/getGameHistory", function(req, res) {
  let game = req.app.completedGames[req.body.gameId];
  res.status(200).send(game);
});

router.post("/getAvailableGames", function(req, res){
//  activeGamesToPlayers[532] = ["test", "sadsa"]
  let activeGamesToPlayers = req.app.activeGamesToPlayers;
  let availableGames = [];
  for (game in activeGamesToPlayers){
    if(activeGamesToPlayers[game] != null && activeGamesToPlayers[game]["BLACK"] == null && activeGamesToPlayers[game]["started"] ==  false){
      console.info("Adding Game");
      availableGames.push({ id: game, host: activeGamesToPlayers[game]["host"] });
    }
  }
  res.send(availableGames);
});


router.post("/logout", function(req, res, next) {
  if (req.session) {
    console.log("Session was " + req.session);
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
        return next(err);
      } else {
        console.log("Destroyed session cookie " + req.session);
        return res.redirect("/pente");
      }
    });
  }

});

router.post("/login", function(req, res){
  console.log("SESSION ID " + req.sessionID)
  let user_name = req.body.username;
  let password = req.body.password;
  var registeredUsers = req.app.registeredUsers;
  console.log("User name = "+user_name+", password is "+password);
  console.log(user_name in registeredUsers);
  if(user_name in registeredUsers){
    let user_salt = registeredUsers[user_name].salt;
    let encrypted_password = sha512(password, user_salt);
    if(registeredUsers[user_name].hash == encrypted_password.hash){
          req.session.username = user_name;
      console.log("SUccessful login from " + user_name);
      return res.status(200).send({
         message: "Successful login from " + user_name
     });
    }
  }
  else {
    console.log("Username or password is incorrect");
     return res.status(406).send({
        message: "Username " + user_name + " or password entered is incorrect"
    });
  }
});

let sha512 = function(password, salt){
    let hash = crypto.createHmac("sha512", salt);
    hash.update(password);
    let value = hash.digest("hex");
    return {
        salt: salt,
        hash: value
    };
};

let genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString("hex")
            .slice(0, length);
};


module.exports = router;
