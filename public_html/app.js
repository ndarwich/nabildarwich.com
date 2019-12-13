const express = require("express");
const crypto = require("crypto");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
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
//helper variables
let usernameregex = /^[a-zA-Z0-9]{5,}$/;
let gameidregex = /^[A-Z0-9]{5}$/;
let passwordregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
//helper functions
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



//all the files under public are static

//dictionary to hold the active games to the players that are in them (max 2 players)
let activeGamesToPlayers = { };
//dictionary to hold players to active games they"re in (no max)
let playersToActiveGames = { };
//dictionary to hold all the completed games
let completedGames = { };
//dictionary to hold the games to the players that played them
let gamesToPlayers = { };
//database of all registered users
let registeredUsers = { };

let databaseFilePath = path.join(__dirname, "database/database.json");
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

app.post("/createPenteAccount", function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let reenteredpassword = req.body.reenteredpassword;
  console.log("Submitted User name = "+username+", password is "+password);
  let username_meets_req = username.match(usernameregex);
  if (! username.match(usernameregex)){
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
  if(!(username in registeredUsers)){
    let salt = genRandomString(16);
    let encrypted_password = sha512(password, salt);
    encrypted_password.wins = 0;
    encrypted_password.losses = 0;
    encrypted_password.ties = 0;
    registeredUsers[username] = encrypted_password;
    let jsonString = JSON.stringify(registeredUsers, null, 4); // Pretty printed
    console.log("jsonString before writefile");
    console.log(jsonString);
    //NOTE: forever.js leads to errors when this writefile is sent
    // fs.writeFile(databaseFilePath, registeredUsers, (err) => {
    //    console.info("Write File Sync");
    //    console.info(err)
    //     if (err) {
    //       return res.status(404).end({message: "Error Registering"});
    //     }
    // });
    console.log("User successfully registered");
     res.status(206).send({
        message: "Username " + username + " registered"
    });
  }
  else {
    console.log("Username already registered");
     return res.status(406).send({
        message: "Username " + username + " already registered"
    });
  }
});

app.get("*", function(req, res){
  res.status(404);
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/error.html", {root: __dirname });
});

console.info("Requiring Socket IO");

var server = require('http').createServer(app);

// port for express server
server.listen(3002, "localhost", function () {
  var users = fs.readFileSync(databaseFilePath);
  if (users != null) {
    console.log("Users successfully read");
    registeredUsers = JSON.parse(users);
  } else {
    console.log("Users unsuccessfully read");
  }
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
     //block malicious users
     if (username == null || ! username.match(usernameregex) ) {
       console.info("Client username is either null or incorrect");
       return;
     }
     if (playersToActiveGames[username] == null) { //if the player doesn't have any active games
       playersToActiveGames[username] = []; //initialize their game to an empty list
     }
     socket.clientUsername = username;
     console.info("Client Login From " + username);
   });

 //when a player joins a game
 socket.on("join-game", function(gameId) {
   //do nothing if client is not logged in
   if (socket.clientUsername == null || gameId == null) {
     socket.emit('cannot-join', "Cannot join as you're not logged in or you didn't provide a game ID");
     return;
   }
   //do nothing if client is not logged in
   if (! gameId.match(gameidregex)) {
     socket.emit('cannot-join', "Cannot join as gameID must exactly 5 A-Z, 0-9 characters");
     return;
   }
   //joining game conditions for failure
   if (gameId in completedGames) {
     socket.emit('cannot-join', "Cannot join game as it already finished");
     return;
   } else if (gameId in activeGamesToPlayers) {
     if (activeGamesToPlayers[gameId].BLACK != null && activeGamesToPlayers[gameId].BLACK != socket.clientUsername
      && activeGamesToPlayers[gameId].WHITE != null && activeGamesToPlayers[gameId].WHITE != socket.clientUsername) {
        socket.emit('cannot-join', "Spectating games has not been implemented yet")
         return;
      } else if (activeGamesToPlayers[gameId].WHITE == socket.clientUsername && activeGamesToPlayers[gameId].BLACK == null) {
        socket.emit('cannot-join', "Playing against yourself is not allowed. Find some friends :).")
       return;
      }
   }
   console.info("here 3");
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
       if (playersToActiveGames[socket.clientUsername] == []) {
         playersToActiveGames[socket.clientUsername].push(gameId);
       } else {
         playersToActiveGames[socket.clientUsername] = [gameId];
       }
       /////////////////////////START THE GAME/////////////////////////////
       socket.join(gameId);
       socket.gameId = gameId;
       console.info("Game Id Started: " + socket.gameId);
       activeGamesToPlayers[gameId]["started"] = true;
       //store the game in the server
       activeGamesToPlayers[gameId]["game"] = {
         dateStarted: new Date(),
         timeLeft: 60, //default timer for the game to be over is
         NUM_ROWS : 19,
         NUM_COLS : 19,
         currentTurn : "WHITE",
         isDone : false,
         playerTurn : () => {},
         pieceMoved : (piece) => {},
         pieceCleared : (piece) => {},
         capturesMade: { "W": 0, "B": 0 },
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
            var winner = activeGamesToPlayers[gameId][otherColor];
            var loser = activeGamesToPlayers[gameId][currentColor];
            var status = "" + loser + " ran out of time. " + winner + " wins!";
            activeGamesToPlayers[gameId]["game"].isDone = true;
            activeGamesToPlayers[gameId]["winner"] = winner;
            activeGamesToPlayers[gameId]["loser"] = loser;
            activeGamesToPlayers[gameId]["status"] = status;
            activeGamesToPlayers[gameId]["game"]["dateFinished"] = new Date();
            registeredUsers[winner]["wins"] += 1;
            registeredUsers[loser]["losses"] += 1;
            //internals are freed, finish the game
            completedGames[gameId] = activeGamesToPlayers[gameId];
            playersToActiveGames[winner] = playersToActiveGames[winner].filter(game => game != gameId);
            playersToActiveGames[loser] = playersToActiveGames[loser].filter(game => game != gameId);
            io.to(socket.gameId).emit("game-over", status);
            clearInterval(timer);
          }
        }, 1000);
        //start the game
        io.to(gameId).emit("game-started", activeGamesToPlayers[gameId]);
        /////////////////////////FINISH START GAME/////////////////////////////
     }
   //send the game information to the player
   else if (activeGamesToPlayers[gameId] != null && activeGamesToPlayers[gameId]["started"] == true) {
     socket.join(gameId);
     socket.gameId = gameId;
     //emit game-started to the game room
     io.to(gameId).emit("game-started", activeGamesToPlayers[gameId]);
   }
 });

 ////////////////////////////////START PENTE GAME LOGIC/////////////////////////
 //when a player makes a move
 socket.on("piece-moved", function (moveLocation) {
   var gameId = socket.gameId;
   //if the game doesn't exist or the user doesn't, return
   if (socket.clientUsername == null || activeGamesToPlayers[gameId] == null) {
     return;
   }
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
     var winner = activeGamesToPlayers[gameId][otherColor];
     var loser = activeGamesToPlayers[gameId][currentColor];
     activeGamesToPlayers[gameId]["game"].isDone = true;
     activeGamesToPlayers[gameId]["winner"] = winner;
     activeGamesToPlayers[gameId]["loser"] = loser;
     let status = loser + " tried to cheat and illegally move. Cheating is not tolerated in Pente. " + winner + " wins!!";
    activeGamesToPlayers[gameId]["status"] = status;
    activeGamesToPlayers[gameId]["game"]["dateFinished"] = new Date();
    registeredUsers[winner]["wins"] += 1;
    registeredUsers[loser]["losses"] += 1;
    //internals are freed, finish the game
    completedGames[gameId] = activeGamesToPlayers[gameId];
    playersToActiveGames[winner] = playersToActiveGames[winner].filter(game => game != gameId);
    playersToActiveGames[loser] = playersToActiveGames[loser].filter(game => game != gameId);
    io.to(gameId).emit("game-over", status);
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
     console.log("Clear pieces error")
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
         activeGamesToPlayers[gameId]["game"]["capturesMade"][color] += 1;
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
       let status = winner + " won with " + maxInARow + " in a row!\nCongratulations " + winner + "!!";
       activeGamesToPlayers[gameId]["game"].isDone = true;
       activeGamesToPlayers[gameId]["winner"] = winner;
       activeGamesToPlayers[gameId]["loser"] = loser;
       activeGamesToPlayers[gameId]["status"] = status;
       activeGamesToPlayers[gameId]["game"]["dateFinished"] = new Date();
       registeredUsers[winner]["wins"] += 1;
       registeredUsers[loser]["losses"] += 1;
       //internals are freed, finish the game
       completedGames[gameId] = activeGamesToPlayers[gameId];
       playersToActiveGames[winner] = playersToActiveGames[winner].filter(game => game != gameId);
       playersToActiveGames[loser] = playersToActiveGames[loser].filter(game => game != gameId);
       io.to(gameId).emit("game-over", status);
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
   var gameId = socket.gameId;
   //winning condition 1: 5 captures
   let capturesMade = activeGamesToPlayers[gameId]["game"]["capturesMade"][color];
   if (capturesMade >= 5) {
     var winnerColor = color == 'W' ? "WHITE" : "BLACK";
     var loserColor = color == 'W' ? "BLACK" : "WHITE";
     var winner = activeGamesToPlayers[gameId][winnerColor];
     var loser = activeGamesToPlayers[gameId][loserColor];
     let status = winner + " won with " + capturesMade + " captures!\nCongratulations " + winner + "!!";
     activeGamesToPlayers[gameId]["game"].isDone = true;
     activeGamesToPlayers[gameId]["winner"] = winner;
     activeGamesToPlayers[gameId]["loser"] = loser;
     activeGamesToPlayers[gameId]["status"] = status;
     activeGamesToPlayers[gameId]["game"]["dateFinished"] = new Date();
     registeredUsers[winner]["wins"] += 1;
     registeredUsers[loser]["losses"] += 1;
     //internals are freed, finish the game
     completedGames[gameId] = activeGamesToPlayers[gameId];
     playersToActiveGames[winner] = playersToActiveGames[winner].filter(game => game != gameId);
     playersToActiveGames[loser] = playersToActiveGames[loser].filter(game => game != gameId);
     io.to(gameId).emit("game-over", status);
     return;
   }
   //winning condition 2: 5 in a row
   traverseAllDirections(socket, row, column, color, false);
 }
 ////////////////////////////////END PENTE GAME LOGIC/////////////////////////

 //when a player exits out of a game
 socket.on("disconnect", function (data) {
   if (socket.gameId == null || socket.clientUsername == null) {
     return;
   }
   //record the game's id
   let clientGame = socket.gameId;
   //delete the game if there is no other player
   if (activeGamesToPlayers[clientGame] != null && activeGamesToPlayers[clientGame].BLACK == null) {
     console.info("Deleting Game " + clientGame + " due to no black");
     console.info(activeGamesToPlayers);
     if (playersToActiveGames[socket.clientUsername] != null) {
       //delete the game from the playersToActiveGames dictionary
       playersToActiveGames[socket.clientUsername] = playersToActiveGames[socket.clientUsername].filter(game => game != clientGame)
     }
     //delete the game from the activeGamesToPlayers dictionary
     delete activeGamesToPlayers[clientGame];
   }
 });
});

 //if the client disconnects
 io.on("disconnect", function(socket) {
   if (socket.gameId == null || socket.clientUsername == null) {
     return;
   }
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
    }
  });

  app.completedGames = completedGames;
  app.registeredUsers = registeredUsers;
  app.io = io;
  app.activeGamesToPlayers = activeGamesToPlayers;
  app.playersToActiveGames = playersToActiveGames;
});
