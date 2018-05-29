const express = require("express");
const router = express.Router();

//bio router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/bio.html", { root: __dirname + "/../public" });
});

module.exports = router;
