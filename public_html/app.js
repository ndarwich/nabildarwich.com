const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
//let https = require("https");
let app = express();
let router = express.Router();
//ALL routes are imported
let index = require("./routes/index");
let contact = require("./routes/contact");
let projects = require("./routes/projects");
let bio = require("./routes/bio");
let specialPage = require("./routes/specialPage");
let books = require("./routes/books");
let pente = require("./routes/pente");
//all the files under public are static


//dictionary to hold the active games to the players that are in them (max 2 players)
let activeGamesToPlayers = { };
//dictionary to hold players to active games they"re in (no max)
let playersToActiveGames = { };

//app.use(express.static(path.join(__dirname, "public")));
//for POST requests

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", index);
app.use("/contact", contact);
app.use("/projects", projects);
app.use("/bio", bio);
app.use("/cs367", specialPage);
app.use("/books", books);
app.use("/pente", pente);
app.get("/socket.io/**", function(req, res){
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile("/public/js/" + req.params.index + ".js",
    {root: __dirname });
});
app.get("*/:scriptName.js", function(req, res){
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile("/public/js/" + req.params.scriptName + ".js",
    {root: __dirname });
});
app.get("*/:cascadingStyleSheet.css", function(req, res){
  res.setHeader("Content-Type", "text/css");
  res.sendFile("/public/css/" + req.params.cascadingStyleSheet + ".css",
    {root: __dirname });
});

app.get("*/:imageFile.png", function(req, res){
  res.setHeader("Content-Type", "image/png");
  res.sendFile("/public/img/" + req.params.imageFile + ".png",
    {root: __dirname });
});

app.get("*/:imageFile.jpg", function(req, res){
  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile("/public/img/" + req.params.imageFile + ".jpg",
    {root: __dirname });
});

app.get("*/components/:componentName", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/components/" + req.params.componentName,
    {root: __dirname });
});

app.get("*/pages/:pageName", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/pages/" + req.params.pageName, {root: __dirname });
});

app.post("/sendMail", (req, res) => {
  const key = "6LcgkLMUAAAAAP04M4TSXtW8IBleHIETBKTslfre";
  let googleReq = "https://www.google.com/recaptcha/api/siteverify?secret="
    + key + "&response=" + req.body["g-recaptcha-response"];
    auth = {
      user: "nabildarwichdotcom@gmail.com",
      pass: process.env.nabilddotcom
    };
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: auth
  });
  let isBot = req.body["g-recaptcha-response"] === "" ? "BOT" : "Human";
  console.log(JSON.stringify(req.headers));
  let mailOptions = {
    from: "nabildarwichdotcom@gmail.com",
    to: "dnabil1996@gmail.com",
    subject: req.body.subject,
    text: isBot + "\n" + req.connection.remoteAddress + "\n" +
      req.get("x-forwarded-for") + "\n" + req.body.email + "\n" + req.body.name
      + " wrote:\n" + req.body.message
  };
  //X-Forwarded-For
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      console.log(mailOptions);
    } else {
      res.setHeader("Content-Type", "text/html");
      let botResponse = isBot === "BOT" ? "... You are a bot though" : "";
      res.end("Mail Sent Successfully" + botResponse
        + ". Return to homepage <a href='/'>here</a>.");
    }
  });
});

app.get("*", function(req, res){
  res.status(404);
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/error.html", {root: __dirname });
});

console.info("Requiring Socket IO");
console.info(app);

var server = require('http').createServer(app);

// port for express server
server.listen(3002, "localhost", function () {
  console.info("Listening on port 3002...");
  console.info("Requiring Socket IO too");
  //console.log(io);
  var io = require("socket.io").listen(server);
  console.info("Requiring Socket IO success");
  io.on('connection', function(socket){
   console.log('a user connected');
   socket.on("connection", function(data) {
      console.log("Player connected!", socket.id);
      socket.emit("client-login", "Hello World from client");
   });

   socket.on("client-login", function(player) {
     console.log("Player joined with id " + player);
   });

   //when a player logs in the socket needs to have the client's username in all subsequent interactions
   socket.on("client-login", function(username) {
     if (playersToActiveGames[username] == null) { //if the player doesn't have any active games
       playersToActiveGames[username] = []; //initialize their game to an empty list
     }
     socket.clientUsername = username;
     console.info("Client Login From " + username);
   });

 //when a player joins a game
 socket.on("join-game", function(gameId) {
   //Case 1: game is getting created
   if (!(gameId in activeGamesToPlayers)) {
     console.info("Join Game Received 1");
     //if there is already e player in the game
     //update our data structures with game info
     activeGamesToPlayers[gameId] = { "WHITE": socket.clientUsername, "host": socket.clientUsername, "started": false };
     if (playersToActiveGames[socket.clientUsername]) {
       playersToActiveGames[socket.clientUsername].push(gameId);
     } else {
       playersToActiveGames[socket.clientUsername] = [gameId];
     }
     socket.join(gameId);
     socket.gameId = gameId;
     console.info("Game Id" + socket.gameId);
   } else if (gameId in activeGamesToPlayers && activeGamesToPlayers[gameId].BLACK == null && activeGamesToPlayers[gameId].WHITE != socket.clientUsername) {
       console.info("Join Game Received 2");
       //if there is already e player in the game
       activeGamesToPlayers[gameId]["BLACK"] = socket.clientUsername; //black joins the game
       playersToActiveGames[socket.clientUsername] = playersToActiveGames[socket.clientUsername] ? playersToActiveGames[socket.clientUsername].push(gameId) : [gameId];
       socket.join(gameId);
       socket.gameId = gameId;
       socket.emit("setPlayerTurn", "BLACK"); // emit only to the sender
       /////////////////////////START THE GAME/////////////////////////////
       console.info("Game Id Started: " + socket.gameId);
       activeGamesToPlayers[gameId]["started"] = true;
       //store the game in the server
       activeGamesToPlayers[gameId]["game"] = {
         timeLeft: 60, //default timer for the game to be over is
         NUM_ROWS : 19,
         NUM_COLS : 19,
         currentTurn : "WHITE",
         isDone : false,
         playerTurn : () => {},
         pieceMoved : (piece) => {},
         pieceCleared : (piece) => {},
         board: []
       };
       //as the game started, initialize the game board
       var board = []
       for (let rowNumber = 0; rowNumber < activeGamesToPlayers[gameId]["game"]["board"].NUM_ROWS; rowNumber++) {
         let newRow = [];
         for (let colNumber = 0; colNumber < activeGamesToPlayers[gameId]["game"]["board"].NUM_COLS; colNumber++) {
           newRow.push('A'); //in our server, we will just store the space as a character A | B | W
         }
         board.push(newRow);
       }
       activeGamesToPlayers[gameId]["game"]["board"] = board;
       //also initialize the timer and update it every second
       setInterval(function() {
          //decrement the timer and emit the new time to both players
          activeGamesToPlayers[gameId]["game"]["timeLeft"] -= 1;
          io.to(gameId).emit("tik-tok", activeGamesToPlayers[gameId]["game"]["timeLeft"]);
        }, 1000);
        /////////////////////////FINISH START GAME/////////////////////////////
     }
   //send the game information to the player
   if (activeGamesToPlayers[gameId] != null && activeGamesToPlayers[gameId]["started"] == true) {
     io.to(gameId).emit("game-started", activeGamesToPlayers[gameId]);
   }
 });

 ////////////////////////////////START PENTE GAME LOGIC/////////////////////////
 //when a player makes a move
 socket.on("piece-moved", function (moveLocation) {
   if (socket.clientUsername == null || activeGamesToPlayers[gameId] == null) {
     return;
   }
   console.log("Movement by " + socket.clientUsername);
   //check if the movement is legal, if it's not,this is cheating
   console.log(socket.gameId);
   console.log(moveLocation);
   var currentTurn = activeGamesToPlayers[gameId]["game"].currentTurn;
   var opposingTurn = currentTurn == "WHITE" ? "BLACK" : "WHITE";
   var pieceCharacter = currentTurn == "WHITE" ? 'W' : 'B';
   var gameId = socket.gameId;
   //a player has to place a piece in the bounds, it's the player's turn, and it should not be already occupied
   if (moveLocation.row >= 0 && moveLocation.row < activeGamesToPlayers[gameId]["game"].NUM_ROWS
     && moveLocation.column >= 0 && moveLocation.column < activeGamesToPlayers[gameId]["game"].NUM_COLS
     && socket.clientUsername == activeGamesToPlayers[gameId][currentTurn]
     && activeGamesToPlayers[gameId]["game"]["board"][moveLocation.row][moveLocation.column] == 'A') {
       //apply move logic
       activeGamesToPlayers[gameId]["game"]["board"][moveLocation.row][moveLocation.column] = pieceCharacter;
       //update internals
      activeGamesToPlayers[gameId]["game"]["currentTurn"] == opposingTurn;
     //emit this move to the other sockets in the room
    // io.to(socket.gameId).emit("piece-played", moveLocation);
    io.to(socket.gameId).emit("piece-played", {row: moveLocation.row, column: moveLocation.column, player: currentTurn});
   } else {
     console.log("Illegal Move");
     io.to(socket.gameId).emit("player-cheated", socket.clientUsername + " tried to cheat and illegally move. Cheating is not tolerated in Pente. "
      + activeGamesToPlayers[gameId][opposingTurn] + " wins!!");
   }
 });
 socket.on("clearpiece", function (data) {
     io.to(socket.gameId).emit("clearPiece", {row: data[0], col:data[1]});
 });
 ////////////////////////////////END PENTE GAME LOGIC/////////////////////////

 //when a player exits out of a game
 socket.on("disconnect", function (data) {
   //record the game's id
   let clientGame = socket.gameId;
   //delete the game if there is no other player
   if (activeGamesToPlayers[clientGame] != null && activeGamesToPlayers[clientGame].BLACK == null) {
     console.info("Deleting Game " + clientGame + " due to no black");
     console.info(activeGamesToPlayers);
     //delete the game from the playersToActiveGames dictionary
     playersToActiveGames[socket.clientUsername] = playersToActiveGames[socket.clientUsername].filter(game => game != clientGame)
     //delete the game from the activeGamesToPlayers dictionary
     delete activeGamesToPlayers[clientGame];
     console.info(playersToActiveGames);
     console.info(activeGamesToPlayers);
   }
 });
});

 //if the client disconnects
 io.on("disconnect", function(socket) {
    console.log("Player Disconnected");
    //record the game's id
    let clientGame = socket.gameId;
    //delete the game if there is no other player
    if (activeGamesToPlayers[clientGame] != null && activeGamesToPlayers[clientGame].BLACK == null) {
      console.info("Deleting Game " + clientGame + " due to no black");
      //delete the game from the playersToActiveGames dictionary
      playersToActiveGames[socket.clientUsername] = playersToActiveGames[socket.clientUsername].filter(game => game != clientGame)
      //delete the game from the activeGamesToPlayers dictionary
      delete activeGamesToPlayers[clientGame];
      console.info(playersToActiveGames);
      console.info(activeGamesToPlayers);
    }
  });

  app.io = io;
  app.activeGamesToPlayers = activeGamesToPlayers;
  app.playersToActiveGames = playersToActiveGames;
});
