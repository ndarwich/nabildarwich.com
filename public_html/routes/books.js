const express = require("express");
const router = express.Router();
//to get relevant file info
const fs = require("fs");

//books router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/books.html", { root: __dirname + "/../public" });
});

router.get("/text/:bookName.txt", function(req, res){
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/books/text/" + req.params.bookName + ".txt", { root: __dirname + "/../public" });
});

router.get("/textBooks", function(req, res){
  res.setHeader("Content-Type", "text/json");
  var directoryPath = "" + __dirname + "/../public/books/text";
  let dirFiles = [];
  fs.readdir(directoryPath, (err, files) => {
    //error handling
    if (err) {
        return console.log("Error reading directory: " + err);
    }
    //go over every file, recording file size stat
    files.forEach(function (fileName) {
        let fileSize = fs.statSync(directoryPath + "/" + fileName).size;
        let file = {fileName, fileSize};
        dirFiles.push(file);
      });
      res.send(dirFiles);
      res.end();
    });

});

module.exports = router;
