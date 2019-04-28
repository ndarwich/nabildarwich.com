const express = require("express");
const router = express.Router();
//to get relevant file info
const fs = require("fs");

//books router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/books.html", { root: __dirname + "/../public" });
});

router.get("/books/:bookType", function(req, res){
  res.setHeader("Content-Type", "text/json");
  var directoryPath = "" + __dirname + "/../public/books/" + req.params.bookType;
  let dirFiles = [];
  fs.readdir(directoryPath, (err, files) => {
    //error handling
    if (err) {
        return console.log("Error reading directory: " + err);
    }
    //go over every file, recording file size stat
    files.forEach(function (fileName) {
        let fileSize = Math.trunc(fs.statSync(directoryPath + "/" + fileName).size);
        let file = {fileName, fileSize};
        dirFiles.push(file);
      });
      res.send(dirFiles);
      res.end();
    });
});

router.get("/getBook/:bookType/:bookName", function(req, res){
  let header = "";
  let bookPath = "/books/" + req.params.bookType + "/" + req.params.bookName;
  switch (req.params.bookType) {
    case "text":
      header = "text/html";
      break;
    case "image":
      header = "image/png";
      break;
    case "audio":
      header = "audio/mpeg";
      break;
    case "video":
      header = "video/mp4";
      break;
    case "misc":
      let book = __dirname + "/../public" + bookPath;
      res.download(book);
      return;
    default:
      header = "text/html";
      break;
  }
  res.setHeader("Content-Type", header);
  res.sendFile(bookPath, { root: __dirname + "/../public" });
});

module.exports = router;
