var express = require("express");
var app = express();
var path = require("path");
var router = express.Router();

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/index.html", {root: __dirname });
});

app.get("/bio", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/bio.html", {root: __dirname });
});

app.get("/projects", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", {root: __dirname });
});

app.get("/contact", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/contact.html", {root: __dirname });
});

app.get("/css/:cssFileName", (req, res) => {
  res.setHeader("Content-Type", "text/css");
  res.sendFile("/public/css/" + req.params.cssFileName, {root: __dirname });
});

app.get("/img/:imgFileName", (req, res) => {
  res.sendFile("/public/img/" + req.params.imgFileName, {root: __dirname });
});

app.get("/js/:fileName", (req, res) => {
  res.setHeader("Content-Type", "text/js");
  res.sendFile("/public/js/" + req.params.fileName, {root: __dirname });
});

app.get("/components/:componentName", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/components/" + req.params.componentName,
    {root: __dirname });
});

app.get("/pages/:pageName", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/public/pages/" + req.params.pageName, {root: __dirname });
});


app.get("*", (req, res) => {
  res.status(404);
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/error.html", {root: __dirname });
});

//port for express server
app.listen(3002, () => {
  console.info("Listening on port 3002...");
});

//all the files under public are static
app.use(express.static(path.join(__dirname, "public")));
