const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
var app = express();
var router = express.Router();
//ALL routes are imported
let index = require("./routes/index");
let contact = require("./routes/contact");
let projects = require("./routes/projects");
let bio = require("./routes/bio");

//all the files under public are static
app.use(express.static(path.join(__dirname, "public")));
//for POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", index);
app.use("/contact", contact);
app.use("/projects", projects);
app.use("/bio", bio);


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

app.post("/sendMail", (req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nabildarwichdotcom@gmail.com",
      pass: process.env.nabildarwichdotcom
    }
  });
  let mailOptions = {
    from: "nabildarwichdotcom@gmail.com",
    to: "dnabil1996@gmail.com",
    subject: req.body.subject,
    text: "" + req.body.email + " wrote:\n" + req.body.message
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      res.end("Mail Sent Successfully: " + info.response);
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
