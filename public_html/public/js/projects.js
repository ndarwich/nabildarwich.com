const jgURL = "https://github.com/ndarwich/Nabil-s-Game-Collection/";
const twURL = "http://www.tetriworld.com/";

$(window).on("load", function() {
  loadNavigation(2);
  $("#page-body").load("../pages/projectsMenu.html");

  $("body").on("click", "#dormbuddy", function () {
    loadItem(1);
  });
  $("body").on("click", "#javagames", function () {
    loadItem(2);
  });
  $("body").on("click", "#tetriworld", function () {
    loadItem(3);
  });
  $("body").on("click", "#back-button", function () {
    loadItem(0);
  });
  $("body").on("click", ".jg-item", function () {
    window.open(jgURL);
  });
  $("body").on("click", "#play-tw", function () {
    window.open(twURL);
  });
});

clearBody = function () {
  $("#page-body").css("opacity", 0);
  $("#alt-body").css("opacity", 0);
  $("#page-body").html("");
  $("#alt-body").html("");
}

loadItem = function (itemId) {
  clearBody();
  switch (itemId) {
    case 0:
      $("#page-body").load("../pages/projectsMenu.html");
      $("#page-body").css("opacity", 1);
      break;
    case 1:
      $("#alt-body").load("../pages/dormbuddy.html");
      $("#alt-body").css("opacity", 1);
      break;
    case 2:
      $("#alt-body").load("../pages/javagames.html");
      $("#alt-body").css("opacity", 1);
      break;
    case 3:
      $("#alt-body").load("./pages/tetriworld.html");
      $("#alt-body").css("opacity", 1);
      break;
    default:
      break;
  }
};
