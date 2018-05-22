const baseGameURL = "https://github.com/ndarwich/Nabil-s-Game-Collection/";

$(window).on("load", function() {
  loadPage(2);
  $("#page-body").load("../pages/projectsMenu.html");

  $("body").on("click", "#dormbuddy", () => {
    loadItem(1);
  });
  $("body").on("click", "#javagames", () => {
    loadItem(2);
  });
  $("body").on("click", "#tetriworld", () => {
    loadItem(3);
  });
  $("body").on("click", "#back-button", () => {
    loadItem(0);
  });
  $("body").on("click", ".jg-item", (event) => {
    window.open(baseGameURL);
  });

});

clearBody = () => {
  $("#page-body").html("");
}

loadItem = (itemId) => {
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
