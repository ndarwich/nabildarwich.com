const baseGameURL = "https://github.com/ndarwich/Nabil-s-Game-Collection/";

$(window).on("load", function() {
  loadPage(2);
  $("#page-body").load("../pages/projectsMenu.html");

  $("body").on("click", "#dormbuddy", () => {
    loadItem(0);
  });
  $("body").on("click", "#javagames", () => {
    loadItem(1);
  });
  $("body").on("click", "#tetriworld", () => {
    loadItem(2);
  });
  $("body").on("click", "#websites", () => {
    loadItem(3);
  });
  $("body").on("click", "#back-button", () => {
    loadItem(4);
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
      $("#page-body").load("../pages/dormbuddy.html");
      break;
    case 1:
      $("#page-body").load("../pages/javagames.html");
      break;
    case 2:
      $("#page-body").load("./pages/tetriworld.html");
      break;
    case 3:
      $("#page-body").load("../pages/websites.html");
      break;
    case 4:
      $("#page-body").load("../pages/projectsMenu.html");
      break;
    default:
      break;
  }
};
