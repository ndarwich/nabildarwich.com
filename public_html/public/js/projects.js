const jgURL = "https://github.com/ndarwich/Nabil-s-Game-Collection/";
const twURL = "http://www.tetriworld.com/";

$(window).on("load", function() {
  loadPage(2);
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
  $("#page-body").html("");
}

loadItem = function (itemId) {
  clearBody();
  switch (itemId) {
    case 0:
      $("#page-body").load("../pages/projectsMenu.html");
      break;
    case 1:
      $("#page-body").load("../pages/dormbuddy.html");
      break;
    case 2:
      $("#page-body").load("../pages/javagames.html");
      break;
    case 3:
      $("#page-body").load("./pages/tetriworld.html");
      break;
    default:
      break;
  }
};
