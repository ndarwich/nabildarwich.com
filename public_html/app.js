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
   });

   //when a player logs in the socket needs to have the client's username in all subsequent interactions
   socket.on("client-login", function(username) {
     if (username == null) {
       console.info("client username is null");
     }
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
     if (playersToActiveGames[socket.clientUsername] == []) {
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
         board: [],
         moveHistory: []
       };
       //as the game started, initialize the game board
       var board = []
       for (let rowNumber = 0; rowNumber < activeGamesToPlayers[gameId]["game"].NUM_ROWS; rowNumber++) {
         let newRow = [];
         for (let colNumber = 0; colNumber < activeGamesToPlayers[gameId]["game"].NUM_COLS; colNumber++) {
           newRow.push('A'); //in our server, we will just store the space as a character A | B | W
         }
         board.push(newRow);
       }
       activeGamesToPlayers[gameId]["game"]["board"] = board;
       //also initialize the timer and update it every second
       var timer = setInterval(function() {
          //decrement the timer and emit the new time to both players
          activeGamesToPlayers[gameId]["game"]["timeLeft"] -= 1;
          io.to(gameId).emit("tik-tok", activeGamesToPlayers[gameId]["game"]["timeLeft"]);
          //if time ran out
          if (activeGamesToPlayers[gameId]["game"]["timeLeft"] <= 0) {
            //the current player loses and the opposing player wins
            var currentColor = activeGamesToPlayers[gameId]["game"]["currentTurn"];
            var otherColor = currentColor == "WHITE" ? "BLACK" : "WHITE";
            io.to(socket.gameId).emit("game-over", activeGamesToPlayers[gameId][currentColor]
              + " ran out of time. " + activeGamesToPlayers[gameId][otherColor] + " wins!");
            activeGamesToPlayers[gameId]["game"].isDone = true;
            activeGamesToPlayers[gameId]["game"].winner = activeGamesToPlayers[gameId][otherColor];
            //the timer is freed
            pente.completedGamesMoveList[socket.gameId] =   activeGamesToPlayers[gameId]["game"]["moveHistory"];

            clearInterval(timer);
          }
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
   var gameId = socket.gameId;
   if (socket.clientUsername == null || activeGamesToPlayers[gameId] == null) {
     return;
   }
   console.log("Movement by " + socket.clientUsername);
   //check if the movement is legal, if it's not,this is cheating
   console.log(socket.gameId);
   console.log(moveLocation);
   var currentColor = activeGamesToPlayers[gameId]["game"].currentTurn;
   console.info(currentColor);
   var otherColor = currentColor == "WHITE" ? "BLACK" : "WHITE";
   var pieceCharacter = currentColor == "WHITE" ? 'W' : 'B';
   //a player has to place a piece in the bounds, it's the player's turn, and it should not be already occupied
   if (moveLocation.row >= 0 && moveLocation.row < activeGamesToPlayers[gameId]["game"].NUM_ROWS
     && moveLocation.column >= 0 && moveLocation.column < activeGamesToPlayers[gameId]["game"].NUM_COLS
     && socket.clientUsername == activeGamesToPlayers[gameId][currentColor]
     && activeGamesToPlayers[gameId]["game"]["board"][moveLocation.row][moveLocation.column] == 'A') {
       //apply move logic
       activeGamesToPlayers[gameId]["game"]["board"][moveLocation.row][moveLocation.column] = pieceCharacter;
       checkColorsToClear(socket, moveLocation.row, moveLocation.column, pieceCharacter);
       checkIfWin(socket, moveLocation.row, moveLocation.column, pieceCharacter);
       //update internals
       activeGamesToPlayers[gameId]["game"]["currentTurn"] = otherColor;
       activeGamesToPlayers[gameId]["game"]["timeLeft"] = 60; //reset the timer
       activeGamesToPlayers[gameId]["game"]["moveHistory"].push({row: moveLocation.row, column: moveLocation.column, player: socket.clientUsername, color: pieceCharacter});
       //emit this move to the other sockets in the room
       io.to(socket.gameId).emit("piece-played", { "color": pieceCharacter, row: moveLocation.row, column: moveLocation.column });
       io.to(socket.gameId).emit("move-history", activeGamesToPlayers[gameId]["game"]["moveHistory"]);
   } else {
     console.log("Illegal Move");
     activeGamesToPlayers[gameId]["game"].isDone = true;
     activeGamesToPlayers[gameId]["game"].winner = activeGamesToPlayers[gameId][otherColor];
     io.to(socket.gameId).emit("game-over", activeGamesToPlayers[gameId][currentColor] + " tried to cheat and illegally move. Cheating is not tolerated in Pente. "
      + activeGamesToPlayers[gameId][otherColor] + " wins!!");
      pente.completedGamesMoveList[socket.gameId] =   activeGamesToPlayers[gameId]["game"]["moveHistory"];
   }
 });
 /**
  * Helper function to clear other piece's colors in a spectific direction;
  */
 let clearPiecesInDirection = (socket, row, col, color, xOffset, yOffset) => {
   if (socket == null) {
     console.log("Clear Pieces No Socket");
     return;
   }
   let gameId = socket.gameId;
   if (gameId == null || activeGamesToPlayers[gameId] == null || activeGamesToPlayers[gameId]["game"] == null || activeGamesToPlayers[gameId]["game"]["board"] == null) {
     console.log("clear pieces error")
     return;
   }
   let board = activeGamesToPlayers[gameId]["game"]["board"];
   let multiplier = 1;
   let numOppositePieces = 0;
   //traverse until we are out of bounds/the stopping conditions are met
   while (row + yOffset*multiplier >= 0 && row + yOffset*multiplier < 19 &&
          col + xOffset*multiplier >= 0 && col + xOffset*multiplier < 19) {
     let existingPiece = board[row + yOffset*multiplier][col + xOffset*multiplier];
     if (existingPiece == 'A' || existingPiece == color) {
       if (numOppositePieces == 2 && existingPiece == color) {
         //clear the pieces in between
         activeGamesToPlayers[gameId]["game"]["board"][row + yOffset*1][col + xOffset*1] = 'A';
         activeGamesToPlayers[gameId]["game"]["board"][row + yOffset*2][col + xOffset*2] = 'A';
         console.info("Pieces Cleared");
         //in the client as well
         io.to(gameId).emit("piece-cleared", {row: row + yOffset*1, column: col + xOffset*1});
         io.to(gameId).emit("piece-cleared", {row: row + yOffset*2, column: col + xOffset*2})
       }
       return;
     }
     numOppositePieces++;
     //do not clear colors if more than 2 opposite pieces are in between
     if (numOppositePieces > 2) {
       return;
     }
     //increment the multiplier
     multiplier++;
   }
 }
 /**
  * Helper function to traverse a board, backtracking if the condition for clearping is met.
  */
 let traverseBoard = (socket, row, col, color, xOffset, yOffset, clear) => {
   if (socket == null) {
     console.log("Traverse Board No Socket");
     return;
   }
   let gameId = socket.gameId;
   if (gameId == null || activeGamesToPlayers[gameId] == null || activeGamesToPlayers[gameId]["game"] == null || activeGamesToPlayers[gameId]["game"]["board"] == null) {
     console.log("traverse board error")
     return;
   }
   let board = activeGamesToPlayers[gameId]["game"]["board"];
   //when it comes to stopping the traversal, either a piece has to be empty or the same colorif we're clearing
   //or be either empty or a different color if we're checking for a winner
   let additionalStoppingCondition = clear ? color : color == 'W' ? 'B' : 'W';
   let multiplier = 1;
   let piecesInARow = 0; //the number of pieces in a row is initially 1 + traversed pieces
   //traverse until we are out of bounds/the stopping conditions are met
   while (row + yOffset*multiplier >= 0 && row + yOffset*multiplier < 19 &&
          col + xOffset*multiplier >= 0 && col + xOffset*multiplier < 19) {
     let existingPiece = board[row + yOffset*multiplier][col + xOffset*multiplier];
     if (existingPiece == 'A' || existingPiece == additionalStoppingCondition) {
       //OTHELLO: clear colors only if the same color on the other end
       if (clear && existingPiece == additionalStoppingCondition) {
         clearPiecesInDirection(socket, row, col, color, xOffset, yOffset)
       }
        break;
     }
     //increment the multiplier and piecesInARow
     piecesInARow++;
     multiplier++;
   }
   return piecesInARow;
 }
 /**
  * Helper function to traverse a board in all directions
  */
 let traverseAllDirections = (socket, row, col, color, clear) => {
   let gameId = socket.gameId;
   let board = activeGamesToPlayers[gameId]["game"]["board"];
   let east = traverseBoard(socket, row, col, color, 1, 0, clear); //to the east
   let north = traverseBoard(socket, row, col, color, 0, 1, clear); //to the north
   let west = traverseBoard(socket, row, col, color, -1, 0, clear); //to the west
   let south = traverseBoard(socket, row, col, color, 0, -1, clear); //to the south
   let northEast = traverseBoard(socket, row, col, color, 1, 1, clear); //to the northeast
   let northWest = traverseBoard(socket, row, col, color, -1, 1, clear); //to the northwest
   let southEast = traverseBoard(socket, row, col, color, 1, -1, clear); //to the southeast
   let southWest = traverseBoard(socket, row, col, color, -1, -1, clear); //to the southwest
   //if checking for winning
   if (!clear) {
     //1 is added to include the current piece
     let horizontalPieces = 1 + east + west;
     let verticalPieces = 1 + north + south;
     let diagonalOnePieces = 1 + northEast + southWest;
     let diagonalTwoPieces = 1 + northWest + southEast;
     let maxInARow = Math.max(horizontalPieces, verticalPieces, diagonalOnePieces, diagonalTwoPieces);
     if (maxInARow >= 5) {
       var winnerColor = color == 'W' ? "WHITE" : "BLACK";
       var loserColor = color == 'W' ? "BLACK" : "WHITE";
       var winner = activeGamesToPlayers[gameId][winnerColor];
       var loser = activeGamesToPlayers[gameId][loserColor];
       activeGamesToPlayers[gameId]["game"].isDone = true;
       activeGamesToPlayers[gameId]["game"].winner = winner;
       activeGamesToPlayers[gameId]["game"].loser = loser;
       io.to(gameId).emit("game-over", color + " won with " + maxInARow + " in a row!\nCongratulations " + winner + "!!");
       pente.registeredUsers[winner]["wins"] += 1;
       pente.registeredUsers[loser]["losses"] += 1;
       pente.gamesToPlayers[gameId] = { "winner": winner, "loser": loser };
     }
   }
 }
 /**
  * Pente Logic to check if opponent pieces can be removed from board.
  */
 let checkColorsToClear = (socket, row, column, color) => {
   traverseAllDirections(socket, row, column, color, true);
 }
 /**
  * Game logic to end when 5 in a row is met.
  */
 let checkIfWin = (socket, row, column, color) => {
   traverseAllDirections(socket, row, column, color, false);
 }
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
//  console.log(pente.registeredUsers);
});
