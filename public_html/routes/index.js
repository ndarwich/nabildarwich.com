const express = require("express");
const router = express.Router();

let numVisits = 88;

//index router
router.get("/", (req, res) => {
  let storedCookie = req.headers.cookie;
  if (storedCookie == null || !storedCookie.includes("magicCookie")) {
    console.info("Does not include magicCookie");
    numVisits++;
  }
  console.info("Does include magicCookie");
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/index.html", { root: __dirname + "/../public" });
});

router.get("/numVisitors", (req, res) => {
  console.info("visitors request " + numVisits);
  res.status(200).send("" + numVisits);
});

module.exports = router;
