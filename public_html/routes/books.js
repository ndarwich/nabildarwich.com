const express = require("express");
const router = express.Router();

//bio router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/books.html", { root: __dirname + "/../public" });
});

router.get("/books/:bookName", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/books/:bookName", { root: __dirname + "/../public" });
});

module.exports = router;
