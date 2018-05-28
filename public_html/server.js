const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const querystring = require("querystring");
const request = require("request");
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/index.html", {root: __dirname });
});

app.get("/bio", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/bio.html", {root: __dirname });
});

app.get("/projects", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", {root: __dirname });
});

app.get("/contact", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/contact.html", {root: __dirname });
});

app.get("/css/:cssFileName", function(req, res){
  res.setHeader("Content-Type", "text/css");
  res.sendFile("/public/css/" + req.params.cssFileName, {root: __dirname });
});

app.get("/img/:imgFileName", function(req, res){
  res.sendFile("/public/img/" + req.params.imgFileName, {root: __dirname });
});

app.get("/js/:fileName", function(req, res){
  res.setHeader("Content-Type", "text/js");
  res.sendFile("/public/js/" + req.params.fileName, {root: __dirname });
});

app.get("/components/:componentName", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/components/" + req.params.componentName,
    {root: __dirname });
});

app.get("/pages/:pageName", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/pages/" + req.params.pageName, {root: __dirname });
});

app.post("/contact", function(req, res){
  let postData = req.body;
  var querystring = require("querystring");
  var qs = querystring.stringify(postData);
  var qslength = qs.length;
  var options = {
      hostname: "nabildarwich.com",
      port: 80,
      path: "/public/php/sendMail.php",
      method: "POST",
      headers:{
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": qslength
      }
};

var buffer = "";
var req = http.request(options, function(res) {
    res.on("data", function (chunk) {
       buffer+=chunk;
    });
    res.on("end", function() {
        console.log(buffer);
    });
});

req.write(qs);
req.end();
});

/*
app.get("*", function(req, res){
  res.status(404);
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/error.html", {root: __dirname });
});
*/

//port for express server
app.listen(3002, function () {
  console.info("Listening on port 3002...");
});

//all the files under public are static
app.use(express.static(path.join(__dirname, "public")));
