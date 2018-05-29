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

module.exports = router;
