const express = require("express");
const router = express.Router();

let numVisits = 0;

//index router
router.get("/", (req, res) => {
  let storedCookie = req.headers.cookie;
  if (storedCookie == null || !storedCookie.includes("visitorNum")) {
    console.info("Does not include visitorNum");
    numVisits++;
  }
  console.info("Does include visitorNum");
  res.setHeader("Content-Type", "text/html");
  res.sendFile("/index.html", { root: __dirname + "/../public" });
});

router.get("/numVisitors", (req, res) => {
  console.info("visitors request " + numVisits);
  res.status(200).send("" + numVisits);
});

module.exports = router;
