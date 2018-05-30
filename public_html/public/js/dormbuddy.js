//get time and display it as an am/pm locale string
$("#currentTime").text(new Date()
  .toLocaleString("en-US",
  { hour: "numeric", minute: "numeric",
  hour12: true }));
$("#db-screen").load("../components/db-main.html");
$("body").on("click", "#db-db", function () {
  $("#db-screen").load("../components/db-db.html");
});
$("body").on("click", "#db-lb", function () {
  $("#db-screen").load("../components/db-lb.html");
});
$("body").on("click", "#db-mb", function () {
  $("#db-screen").load("../components/db-mb.html");
});
$("body").on("click", "#db-sb", function () {
  $("#db-screen").load("../components/db-sb.html");
});
$("body").on("click", "#db-eb", function () {
  $("#db-screen").load("../components/db-eb.html");
});
$("body").on("click", "#db-pb", function () {
  $("#db-screen").load("../components/db-pb.html");
});
$("body").on("click", "#db-screen-button", function () {
  $("#db-screen").load("../components/db-main.html");
});
