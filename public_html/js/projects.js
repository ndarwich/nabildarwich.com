$(window).on("load", function() {
  loadPage(2);

  $("#page-body").load("../pages/projectsMenu.html");
});

$('body').on('click', '#dormbuddy', () => {
  loadPage(1);
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
      $("#page-body").load("../pages/tetriworld.html");
      break;
    case 3:
      $("#page-body").load("../pages/websites.html");
      break;
    default:
      break;
  }
};
