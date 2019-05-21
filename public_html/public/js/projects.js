const jgURL = "https://github.com/ndarwich/Nabil-s-Game-Collection/";
const twURL = "http://www.tetriworld.com/";
const dbURL = "https://github.com/ndarwich/DormBuddy/";
const nbURL = "http://www.nabild.com/books";

$(window).on("load", function() {
  loadNavigation(2);
  let pageURL = window.location.href;
  if (pageURL.includes("dormBuddy")) {
    loadItem(1);
  } else if (pageURL.includes("javaGames")) {
    loadItem(2);
  } else if (pageURL.includes("tetriworld")) {
    loadItem(3);
  } else if (pageURL.includes("nabilsBooks")) {
    loadItem(4);
  } else {
    loadItem(0);
  }
  $("body").on("click", ".jg-item", function () {
    window.open(jgURL);
  });
  $("body").on("click", "#play-tw", function () {
    window.open(twURL);
  });
  $("body").on("click", "#get-db", function () {
    window.open(dbURL);
  });
  $("body").on("click", "#nb", function () {
    window.open(nbURL);
  });
});

loadItem = function (itemId) {
  switch (itemId) {
    case 0:
      $("#page-body").load("/pages/projectsMenu.html");
      $("#page-body").css("opacity", 1);
      break;
    case 1:
      $("#page-body").load("/pages/dormbuddy.html");
      $("#page-body").css("opacity", 1);
      break;
    case 2:
      $("#page-body").load("/pages/javagames.html");
      $("#page-body").css("opacity", 1);
      break;
    case 3:
      $("#page-body").load("/pages/tetriworld.html");
      $("#page-body").css("opacity", 1);
      break;
    case 4:
      $("#page-body").load("/pages/nabilsbooks.html");
      $("#page-body").css("opacity", 1);
      break;
    default:
      break;
  }
};
