const express = require("express");
const crypto = require("crypto");
const path = require("path");
const router = express.Router();
const fs = require("fs");
var server = require("http").Server(router);
var io = require("socket.io").listen(server);

const uuid = require("uuid/v4");
// var registered_users = {};

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


let databaseFilePath = path.join(__dirname, "../database/database.json");

var users = fs.readFileSync(databaseFilePath);
var registered_users = JSON.parse(users);

let completedGamesMoveList = { };
let gamestoPlayer = { };
/* fs.readFile(databaseFilePath, "utf8", (err, jsonString) => {
  if (err) {
      console.log("File read failed probably because it does not exit...yet", err)
      return
  }
  const users = JSON.parse(jsonString);
  console.log(users);
  for (var user in users){
    registered_users[user] = users[user];
  }
}); */

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

router.get("/gamemovehistory", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect("/pente");
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/gamemovehistory.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/history", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect("/pente");
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/history.html", { root: __dirname + "/../public/pages/pente" });
});

router.post("/getTable", function(req, res) {
  let result = "<table style='width:100%'>";
  result+="<th>Username</th>";
  result+="<th>Win/Loss/Tie Ratio</th>";
  for (user in registered_users){
    result += "<tr><td>" + user + "</td><td>" + registered_users[user].wins + "/" + registered_users[user].losses + "/" + registered_users[user].ties + "</td></tr>";
  }

  result += "</table>";

  res.send(result);
});

router.post("/getGamesTable", function(req, res) {
  let result = "<table style='width:100%'>";
  result+="<th>Past Completed Games</th>";
//  completedGamesMoveList["3"] = "test";
//  gamestoPlayer[3] = [];
//  gamestoPlayer[3].push("sa");
//  gamestoPlayer[3].push("ssas");
  console.log(gamestoPlayer);
  let games = []
  for (gameid in completedGamesMoveList){
  //  result += "<tr><td>" + "<a href=/pente/game?gameId=" + gameid + ">AAAAA</a>TEST</td></tr>";
    result += "<tr><td>" +  "<div class=pente-button id=pente-movehistory-btn><a href=/pente/history?gameId=" + gameid + ">" + gamestoPlayer[gameid][0] + " vs " + gamestoPlayer[gameid][1] + "</a></div>" + "</td></tr>";
  //  games.push(gameid);
//  <div class="pente-button" id="pente-movehistory-btn"><a href="/pente/gamemovehistory">MOVE HISTORY</a></div>
  }
  //<a href="/pente/gamemovehistory">MOVE HISTORY</a>

  result += "</table>";
//window.location.href = "/pente/game?gameId=" + gameId;
  res.send(result);
});

router.post("/getGameHistory", function(req, res) {
  let result = "<table style='width:100%'>";
//  completedGamesMoveList[3] = [];
//  completedGamesMoveList[3].push({row: 5, column: 3, player: "hmughal", color: "WHITE"});
//  completedGamesMoveList[3].push({row: 5, column: 3, player: "hmughal", color: "WHITE"});
  console.log("AAAA");
  let movesList = completedGamesMoveList[req.body.gameId];
//  console.log(movesList);
//  console.log(movesList[0]);
//  console.log(movesList[1]);
  for (move in movesList){
  //  console.log(movesList[move]["row"]);
    result += "<tr><td>"  + movesList[move]["player"] + " placed a piece at row " + movesList[move]["row"] + ", column " + movesList[move]["column"] +  "</td></tr>";
  }
  result += "</table>";
  res.send(result);
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
//  console.log(encrypted_password);
//  console.log(registered_users[user_name]);
  console.log("User name = "+user_name+", password is "+password);
  console.log(user_name in registered_users);
  if(user_name in registered_users){
    let user_salt = registered_users[user_name].salt;
    let encrypted_password = sha512(password, user_salt);
    if(registered_users[user_name].hash == encrypted_password.hash){
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

router.post("/createAccount", function(req, res){
  let user_name = req.body.username;
  let password = req.body.password;
  let reenteredpassword = req.body.reenteredpassword;
  let usernameregex = /^[a-zA-Z0-9]{5,}$/;
  let passwordregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  console.log("Submitted User name = "+user_name+", password is "+password);
  let username_meets_req = user_name.match(usernameregex);
  if (! user_name.match(usernameregex)){
    console.log("Username did not meet requirements!");
     return res.status(406).send({
        message: "Entered username does not meet the requirements."
    });
  }
  if (!password.match(passwordregex)){
    console.log("Password did not meet the criteria!");
     return res.status(406).send({
        message: "Password did not meet the criteria!"
    });  }
  else if (!(password === reenteredpassword)){
    console.log("Passwords did not match");
     return res.status(406).send({
        message: "Passwords did not match"
    });
  }
  if(!(user_name in registered_users)){
    let salt = genRandomString(16);
    let encrypted_password = sha512(password, salt);
    encrypted_password.wins = 0;
    encrypted_password.losses = 0;
    encrypted_password.ties = 0;
    registered_users[user_name] = encrypted_password;
    let jsonString = JSON.stringify(registered_users, null, 4); // Pretty printed
    console.log("jsonString before writefile");
    console.log(jsonString);

    // fs.writeFileSync(databaseFilePath, jsonString, function(err){
    //   console.info("Write File Sync");
    //   console.info(err)
    //     if (err) throw err;
    //     process.exit();
    //   })
    console.log("User successfully registered");
     return res.status(206).send({
        message: "Username " + user_name + " registered"
    });
  }
  else {
    console.log("Username already registered");
     return res.status(406).send({
        message: "Username " + user_name + " already registered"
    });
  }
// code to send an error to the AJAX call
//  return res.status(400).send({
//     message: "This is an error!"
//});
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
module.exports.registered_users = registered_users;
module.exports.completedGamesMoveList = completedGamesMoveList;
module.exports.gamestoPlayer = gamestoPlayer;
