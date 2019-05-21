const express = require("express");
const router = express.Router();

//projects router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/dormBuddy", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/tetriworld", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/javaGames", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/nabilsBooks", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/dormBuddy/overview", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/dormBuddy/laundryBuddy", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/dormBuddy/mapBuddy", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/dormBuddy/studyBuddy", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/dormBuddy/eventBuddy", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

router.get("/dormBuddy/profileBuddy", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/projects.html", { root: __dirname + "/../public" });
});

module.exports = router;
