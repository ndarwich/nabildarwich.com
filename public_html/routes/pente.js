const express = require("express");
const crypto = require('crypto');
const router = express.Router();

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
  var salt = genRandomString(16);
  var encrypted_password = sha512(password, salt);
  console.log(encrypted_password);
  console.log("User name = "+user_name+", password is "+password);
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
