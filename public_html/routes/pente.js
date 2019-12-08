let express = require("express");
let crypto = require('crypto');
let path = require("path");
let router = express.Router();
let fs = require('fs');
let server = require('http').createServer(express);
let io = require('socket.io')(server);
let uuid = require('uuid/v4');

let registered_users = {};
//dictionary to hold the active games to the players that are in them (max 2 players)
let activeGamesToPlayers = { };
//dictionary to hold players to active games they're in (no max)
let playersToActiveGames = { };

let cookieParser = require('cookie-parser');
let session = require('express-session');

let room = 1; // placeholder
router.use(session({
  genid: (req) => {
    console.log('Inside the session middleware')
    console.log(req.sessionID)
    return uuid()
  },
  secret: "key cat",
  resave: false,
  saveUninitialized: true
}));


server.listen(8200);
let databaseFilePath = path.join(__dirname, '../database/database.json');

fs.readFile(databaseFilePath, 'utf8', (err, jsonString) => {
  console.info("Read file");
  console.info(jsonString);
  if (err || jsonString == null || jsonString == "") {
    console.info(databaseFilePath);
    console.info(jsonString);
    console.log("File read failed probably because it does not exit...yet", err)
    return
  }
  try {
    let users = JSON.parse(jsonString);
    for (let user in users){
      registered_users[user] = users[user];
    }
  } catch (e) {
    console.log("Error reading db");
    console.log(jsonString);
    console.log(e);
  }
});

io.on('connection', function(clientSocket) {
      //the socket needs to have the client's username in all subsequent interactions
      clientSocket.on('client-login', function(username) {
        if (playersToActiveGames[username] == null) { //if the player doesn't have any active games
          playersToActiveGames[username] = []; //initialize their game to an empty list
        }
        clientSocket.clientUsername = username;
        console.info("Client Login From " + username);
      });

    clientSocket.on("game-id", function(gameId) {
    	clientSocket.gameId = gameId;
      console.info("Game Id" + clientSocket.gameId);
    });
    clientSocket.on("join-game", function(data) {
    	console.log(data);
    });
    //when a player exits out of a game
    clientSocket.on('disconnect', function (data) {
      //
      let clientGame = clientSocket.gameId;
      //delete the game if there is no other player
      if (activeGamesToPlayers[clientGame] != null && activeGamesToPlayers[clientGame].BLACK == null) {
        console.info("Deleting Game " + clientGame + " due to no black");
        //delete the game from the playersToActiveGames dictionary
        playersToActiveGames[clientSocket.clientUsername] = playersToActiveGames[clientSocket.clientUsername].filter(game => game != clientGame)
        //delete the game from the activeGamesToPlayers dictionary
        delete activeGamesToPlayers[clientGame];
        console.info(playersToActiveGames);
        console.info(activeGamesToPlayers);
      }
    });
    clientSocket.on('movement', function (data) {
      console.log("Movement by " + clientSocket.clientUsername);
      console.log(data[3]);
        console.log(data[2] + " placed piece at row " + data[0] + ", column " + data[1]);
        let pieceinfo = data[2] + " placed piece at row " + data[0] + ", column " + data[1];
        let otherplayer = data[2] == "WHITE" ? "BLACK" : "WHITE";
        io.sockets.emit('piece-played', {row: data[0], col:data[1], clientid:clientSocket.id, piece:data[3], opposingplayer: otherplayer});
    });
    clientSocket.on('clearpiece', function (data) {
        io.sockets.emit('clearPiece', {row: data[0], col:data[1]});
    });

    setInterval(function() {
      io.sockets.emit('state', "players");
      }, 1000 / 60);
//    clientSocket.on('movement', function(data) {
//      console.log(data);
//    });setInterval(function() {
//      io.sockets.emit('state', "players");
//    }, 1000 / 60);
});

io.on('disconnect', function(clientSocket) {
    console.log(`Player Disconnected`);
  });

//pente router
router.get("/", (req, res) => {
   res.cookie('cart', 'test', {maxAge: 900000, httpOnly: true});
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/pente.html", { root: __dirname + "/../public" });
});

router.get("/createAccount", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200);
  let gameId = req.body.gameId;
  if (gameId in activeGamesToPlayers) {
    let activeGame = activeGamesToPlayers[gameId];
    if (activeGame["BLACK"] == null && activeGame["WHITE"] != null) { //if second player hasn't joined yet
      activeGame["BLACK"] = req.session.username; //black joins the game
      playersToActiveGames[req.session.username] = playersToActiveGames[req.session.username] ? playersToActiveGames[req.session.username].push(gameId) : [gameId];
      res.send("Game with id " + gameId + " Found, joining as BLACK");
    } else if (activeGame["WHITE"] == null && activeGame["BLACK"] != null) { //if first player disconnected and wants to reconnect
      activeGame["WHITE"] = req.session.username;
        res.send("Game with id " + gameId + " found, joining as WHITE");
    } else if (activeGame["WHITE"] != null && activeGame["BLACK"] != null) {
      res.send("Game with id " + gameId + " Full");
    } else {
      res.send("No Game with id " + gameId + " Found");
    }
  } else {
    res.send("No Game with id " + gameId + " Found");
  }
});

router.get("/home", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect('/pente');
  }
  console.log("USERNAME IS " + req.session.username);
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/home.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/leaderboards", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect('/pente');
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/leaderboards.html", { root: __dirname + "/../public/pages/pente" });
});

router.post('/getTable',function(req, res){
  let result = '<table style="width:100%">';
  result+="<th>Username</th>";
  result+="<th>Win/Loss/Tie Ratio</th>";
  for (user in registered_users){
    result += "<tr><td>" + user + "</td><td>" + registered_users[user].wins + "/" + registered_users[user].losses + "/" + registered_users[user].ties + "</td></tr>";
  }

  result += '</table>';

  res.send(result);
});

router.post('/getAvailableGames',function(req, res){
//  activeGamesToPlayers[532] = ["test", "sadsa"]
  let availableGames = [];
  for (game in activeGamesToPlayers){
    if(game != null && activeGamesToPlayers[game].BLACK == null){
      availableGames.push({ id: game, host: activeGamesToPlayers[game].WHITE });
    }
  }
  res.send(availableGames);
});


router.post('/logout', function(req, res, next) {
  if (req.session) {
    console.log("Session was " + req.session);
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
        return next(err);
      } else {
        console.log("Destroyed session cookie " + req.session);
        return res.redirect('/pente');
      }
    });
  }

});

router.post('/login',function(req, res){
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
         message: 'Successful login from ' + user_name
     });
    }
  }
  else {
    console.log("Username or password is incorrect");
     return res.status(406).send({
        message: 'Username ' + user_name + ' or password entered is incorrect'
    });
  }

});

router.post('/createAccount',function(req, res){
  let user_name = req.body.username;
  let password = req.body.password;
  let reenteredpassword = req.body.reenteredpassword;
  let usernameregex = /^[a-zA-Z0-9]{5,}$/;
  let passwordregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  console.log("Submitted User name = "+user_name+", password is "+password);
  let username_meets_req = user_name.match(usernameregex);
  if (!(user_name.match(usernameregex))){
    console.log("Username did not meet requirements!");
     return res.status(406).send({
        message: 'Entered username does not meet the requirements.'
    });
  }
  if (!password.match(passwordregex)){
    console.log("Password did not meet the criteria!");
     return res.status(406).send({
        message: 'Password did not meet the criteria!'
    });  }
  else if (!(password === reenteredpassword)){
    console.log("Passwords did not match");
     return res.status(406).send({
        message: 'Passwords did not match'
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
    fs.writeFileSync(databaseFilePath, jsonString, "utf8", function(err){
      console.info("Write File Sync");
      console.info(err)
        if (err) throw err;
        process.exit();
      })
    console.log("User successfully registered");
     return res.status(206).send({
        message: 'Username ' + user_name + ' registered'
    });
  }
  else {
    console.log("Username already registered");
     return res.status(406).send({
        message: 'Username ' + user_name + ' already registered'
    });
  }
// code to send an error to the AJAX call
//  return res.status(400).send({
//     message: 'This is an error!'
//});
});

//helper route to retrieve status of a game if we are able to join it
router.post("/getGameStatus", (req, res) => {
  if (req.session.username == null) {
    res.status(404).send({ error: "Not Logged In, Please log in" });
      return;
  }
  res.setHeader("Content-Type", "text/html");
  res.status(200);
  let gameId = req.body.gameId;
  if (gameId in activeGamesToPlayers) {
    let activeGame = activeGamesToPlayers[gameId];
    if (activeGame["BLACK"] == null && activeGame["WHITE"] != null) { //if second player hasn't joined yet
      activeGame["BLACK"] = req.session.username; //black joins the game
      playersToActiveGames[req.session.username] = playersToActiveGames[req.session.username] ? playersToActiveGames[req.session.username].push(gameId) : [gameId];
      res.send("Game with id " + gameId + " Found, joining as BLACK");
    } else if (activeGame["WHITE"] == null && activeGame["BLACK"] != null) { //if first player disconnected and wants to reconnect
      activeGame["WHITE"] = req.session.username;
        res.send("Game with id " + gameId + " found, joining as WHITE");
    } else if (activeGame["WHITE"] != null && activeGame["BLACK"] != null) {
      res.send("Game with id " + gameId + " Full");
    } else {
      res.send("No Game with id " + gameId + " Found");
    }
  } else {
    res.send("No Game with id " + gameId + " Found");
  }
});

router.get("/home", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect('/pente');
  }
  console.log("USERNAME IS " + req.session.username);
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/home.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/leaderboards", (req, res) => {
  if (req.session.username == undefined){
    console.log("User has no active session");
    return res.redirect('/pente');
  }
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/leaderboards.html", { root: __dirname + "/../public/pages/pente" });
});

router.post('/getTable',function(req, res){
  let result = '<table style="width:100%">';
  result+="<th>Username</th>";
  result+="<th>Win/Loss/Tie Ratio</th>";
  for (user in registered_users){
    result += "<tr><td>" + user + "</td><td>" + registered_users[user].wins + "/" + registered_users[user].losses + "/" + registered_users[user].ties + "</td></tr>";
  }

  result += '</table>';

  res.send(result);
});

router.post('/getAvailableGames',function(req, res){
//  activeGamesToPlayers[532] = ["test", "sadsa"]
  let availableGames = [];
  for (game in activeGamesToPlayers){
    if(game != null && activeGamesToPlayers[game].BLACK == null){
      availableGames.push({ id: game, host: activeGamesToPlayers[game].WHITE });
    }
  }
  res.send(availableGames);
});


router.post('/logout', function(req, res, next) {
  if (req.session) {
    console.log("Session was " + req.session);
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
        return next(err);
      } else {
        console.log("Destroyed session cookie " + req.session);
        return res.redirect('/pente');
      }
    });
  }

});

router.post('/login',function(req, res){
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
         message: 'Successful login from ' + user_name
     });
    }
  }
  else {
    console.log("Username or password is incorrect");
     return res.status(406).send({
        message: 'Username ' + user_name + ' or password entered is incorrect'
    });
  }

});

router.post('/createAccount',function(req, res){
  let user_name = req.body.username;
  let password = req.body.password;
  let reenteredpassword = req.body.reenteredpassword;
  let usernameregex = /^[a-zA-Z0-9]{5,}$/;
  let passwordregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  console.log("Submitted User name = "+user_name+", password is "+password);
  let username_meets_req = user_name.match(usernameregex);
  if (!(user_name.match(usernameregex))){
    console.log("Username did not meet requirements!");
     return res.status(406).send({
        message: 'Entered username does not meet the requirements.'
    });
  }
  if (!password.match(passwordregex)){
    console.log("Password did not meet the criteria!");
     return res.status(406).send({
        message: 'Password did not meet the criteria!'
    });  }
  else if (!(password === reenteredpassword)){
    console.log("Passwords did not match");
     return res.status(406).send({
        message: 'Passwords did not match'
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
    fs.writeFileSync(databaseFilePath, jsonString, function(err){
      console.info("Write File Sync");
      console.info(err)
        if (err) throw err;
        process.exit();
      })
    console.log("User successfully registered");
     return res.status(206).send({
        message: 'Username ' + user_name + ' registered'
    });
  }
  else {
    console.log("Username already registered");
     return res.status(406).send({
        message: 'Username ' + user_name + ' already registered'
    });
  }
// code to send an error to the AJAX call
//  return res.status(400).send({
//     message: 'This is an error!'
//});
});
let sha512 = function(password, salt){
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        hash: value
    };
};

let genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex')
            .slice(0, length);
};

module.exports = router;
