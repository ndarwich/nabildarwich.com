const express = require("express");
const router = express.Router();
//to get relevant file info
const fs = require("fs");

let clientId = 0;

//books router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/books.html", { root: __dirname + "/../public" });
});

router.get("/books/:bookType", function(req, res){
  res.setHeader("Content-Type", "text/json");
  let directoryPath = "" + __dirname + "/../public/books/" + req.params.bookType;
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

let downloadBook = (bookType, bookName, res) => {
  clientId += 1;
  let header = "";
  let timeStamp = new Date()/1000;
  let bookAddress = bookType + "/" + bookName;
  let bookPath = __dirname + "/../public/books/" + bookAddress;
    console.info("" + timeStamp + ": " +  clientId + " request " + bookAddress);
  switch (bookType) {
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
      res.download(bookPath, (err) => {
        timeStamp = new Date()/1000;
        if (err) {
          console.error("" + timeStamp + ": " +  clientId + " fail " + bookAddress);
        }
        else {
          console.info("" + timeStamp + ": " +  clientId + " success " + bookAddress);
        }
      });
      return;
    default:
      header = "text/html";
      break;
  }
  res.setHeader("Content-Type", header);
  res.sendFile("/books/" + bookAddress, { root: __dirname + "/../public" }, (err) => {
      timeStamp = new Date()/1000;
      if (err) {
        console.error("" + timeStamp + ": " +  clientId + " fail " + bookAddress);
      }
      else {
        console.info("" + timeStamp + ": " +  clientId + " success " + bookAddress);
      }
  });
}

router.get("/getRandomBook", (req, res) => {
  const bookTypes = ["text", "image", "audio", "video", "misc"];
  let randomNumber = Math.random() * 100;
  let bookType = "misc";
  if (randomNumber < 25) { //25% chance for text books
    bookType = "text";
  } else if (randomNumber < 50) { //25% chance for image books
    bookType = "image";
  } else if (randomNumber < 70) { //20% chance for video books
    bookType = "audio";
  } else if (randomNumber < 90) { //20% chance for audio books
    bookType = "video";
  } else { //10% chance for misc books
    bookType = "misc";
  }
  let directoryPath = "" + __dirname + "/../public/books/" + bookType;
  let dirFiles = [];
  fs.readdir(directoryPath, (err, files) => {
    //error handling
    if (err) {
        return console.log("Error reading directory: " + err);
    }
    //go over every file, recording file size stat
    files.forEach((fileName) => {
      dirFiles.push(fileName);
    });
    let randomFileIndex = Math.floor(Math.random() * dirFiles.length);
    let randomBook = dirFiles[randomFileIndex];
    downloadBook(bookType, randomBook, res);
  });
});

router.get("/getBook/:bookType/:bookName", function(req, res){
  downloadBook(req.params.bookType, req.params.bookName, res);
});

module.exports = router;
