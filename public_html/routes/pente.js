const express = require("express");
const crypto = require('crypto');
const router = express.Router();
const fs = require('fs');
var server = require('http').createServer(express);
var io = require('socket.io')(server);
var registered_users = {};

server.listen(4200);
io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
    	console.log(data);
    });

});
//pente router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/pente.html", { root: __dirname + "/../public" });
});

router.get("/createAccount", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/createAccount.html", { root: __dirname + "/../public" });
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
    console.log("Username already registered");
     return res.status(406).send({
        message: 'Username ' + user_name + ' already registered'
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
    registered_users[user_name] = encrypted_password;
    var jsonString = JSON.stringify(registered_users, null, 4); // Pretty printed
  //  console.log(jsonString);
    fs.writeFile('./public_html/public/database/database.json', JSON.stringify(registered_users),
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
