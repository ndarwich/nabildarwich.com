const express = require("express");
const crypto = require('crypto');
const path = require("path");
const router = express.Router();
const fs = require('fs');
var server = require('http').createServer(express);
var io = require('socket.io')(server);
var registered_users = {};
//dictionary to hold the active games to the players that are in them (max 2 players)
var activeGamesToPlayers = { };
//dictionary to hold players to active games they're in (no max)
var playersToActiveGames = { };

var cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

var room = 1; // placeholder
app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware')
    console.log(req.sessionID)
    return uuid()
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

server.listen(8200);
const databaseFilePath = path.join(__dirname, '../database/database.json');

fs.readFile(databaseFilePath, 'utf8', (err, jsonString) => {
  if (err) {
      console.log("File read failed probably because it does not exit...yet", err)
      return
  }
  const users = JSON.parse(jsonString);
  for (var user in users){
    registered_users[user] = users[user];
  }
});

io.on('connection', function(clientSocket) {
    console.log('Client created game... with id ' + clientSocket.id);
    //the socket needs to have the client's username in all subsequent interactions
    clientSocket.on('client-login', function(username) {
      clientSocket.clientUsername = username;
      console.info("Client Login From " + username);
    });
    clientSocket.on('join', function(data) {
    	console.log(data);
      io.sockets.emit('client-connected', clientSocket.id);
    });
    clientSocket.on('client_disconnected', function (data) {
      console.info("client disconnect event")
        console.log(data);
    });
    clientSocket.on('disconnect', function (data) {
      console.info("client disconnect event 2")
        console.log(data);
    });
    clientSocket.on('movement', function (data) {
      console.log(data[3]);
        console.log(data[2] + " placed piece at row " + data[0] + ", column " + data[1]);
        let pieceinfo = data[2] + " placed piece at row " + data[0] + ", column " + data[1];
        var otherplayer = data[2] == "WHITE" ? "BLACK" : "WHITE";
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
  console.log(req.sessionID)
   res.cookie('cart', 'test', {maxAge: 900000, httpOnly: true});
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/pente.html", { root: __dirname + "/../public" });
});

router.get("/createAccount", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/createAccount.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/game", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/game.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/home", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/home.html", { root: __dirname + "/../public/pages/pente" });
});

router.get("/leaderboards", (req, res) => {
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



router.post('/login',function(req, res){

  var user_name = req.body.username;
  var password = req.body.password;
//  console.log(encrypted_password);
//  console.log(registered_users[user_name]);
  console.log("User name = "+user_name+", password is "+password);
  console.log(user_name in registered_users);
  if(user_name in registered_users){
    var user_salt = registered_users[user_name].salt;
    var encrypted_password = sha512(password, user_salt);
    if(registered_users[user_name].hash == encrypted_password.hash){
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
  var user_name = req.body.username;
  var password = req.body.password;
  var reenteredpassword = req.body.reenteredpassword;
  var usernameregex = /^[a-zA-Z0-9]{5,}$/;
  var passwordregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  console.log("Submitted User name = "+user_name+", password is "+password);
  var username_meets_req = user_name.match(usernameregex);
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
    var salt = genRandomString(16);
    var encrypted_password = sha512(password, salt);
    encrypted_password.wins = 0;
    encrypted_password.losses = 0;
    encrypted_password.ties = 0;
    registered_users[user_name] = encrypted_password;
    var jsonString = JSON.stringify(registered_users, null, 4); // Pretty printed
  //  console.log(jsonString);
    fs.writeFile(databaseFilePath, JSON.stringify(registered_users),
    function(err){
        if(err) throw err;
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
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        hash: value
    };
};

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex')
            .slice(0, length);
};

module.exports = router;
