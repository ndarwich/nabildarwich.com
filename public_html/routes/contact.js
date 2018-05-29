const express = require("express");
const router = express.Router();

//contact router
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/contact.html", { root: __dirname + "/../public" });
});

module.exports = router;
