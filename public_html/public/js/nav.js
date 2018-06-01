//load a navigation page and change its background
loadNavigation = (p) => {
  $("#navigation").load("/components/navigation.html", () => {
    $("#nav" + p).addClass("active");
  });
}

$(window).on("load", function() {
    $("#page-body").addClass("load-page");
});
