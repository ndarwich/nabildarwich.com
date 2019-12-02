const express = require("express");
const router = express.Router();

//index router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/index.html", { root: __dirname + "/../public" });
});

module.exports = router;
