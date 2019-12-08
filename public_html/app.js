const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
let https = require("https");
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

//port for express server
app.listen(3002, function () {
  console.info("Listening on port 3002...");
});
