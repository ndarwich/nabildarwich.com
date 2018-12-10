$(window).on("load", function() {
    loadNavigation(-1);
    let pageURL = window.location.href;
  $("#page-body").load("/pages/cs367.html");
});
