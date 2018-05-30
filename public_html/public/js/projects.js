const jgURL = "https://github.com/ndarwich/Nabil-s-Game-Collection/";
const twURL = "http://www.tetriworld.com/";
const dbURL = "https://github.com/ndarwich/DormBuddy/";

$(window).on("load", function() {
  loadNavigation(2);
  let pageURL = window.location.href;
  if (pageURL.includes("dormBuddy")) {
    loadItem(1);
  } else if (pageURL.includes("javaGames")) {
    loadItem(2);
  } else if (pageURL.includes("tetriworld")) {
    loadItem(3);
  } else {
    loadItem(0);
  }
  $("body").on("click", ".jg-item", function () {
    window.open(jgURL);
  });
  $("body").on("click", "#play-tw", function () {
    window.open(twURL);
  });
  $("body").on("click", "#get-dormBuddy", function () {
    window.open(dbURL);
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
