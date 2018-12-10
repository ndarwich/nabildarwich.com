const express = require("express");
const router = express.Router();

//special page
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/specialPage.html", { root: __dirname + "/../public" });
});

module.exports = router;
