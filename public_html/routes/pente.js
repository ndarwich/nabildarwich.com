const express = require("express");
const router = express.Router();

//pente router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/pente.html", { root: __dirname + "/../public" });
});

//pente login
router.get("/login", (req, res) => {
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

module.exports = router;
