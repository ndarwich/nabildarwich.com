//load a navigation page and change its background
loadNavigation = (p) => {
  $("#navigation").load("/components/navigation.html", () => {
    $("#nav" + p).addClass("active");
  });
}

$(window).on("load", function() {
    $("#page-body").addClass("load-page");
    $("body").on("click", ".displayable-photo", (e) => {
    console.info(e.target.src);
    loadImage(e.target.src);
  });
});

let loadImage = (imgUrl) => {
  $("#page-body").load("/components/image-page.html", () => {
    console.info(imgUrl);
    $("#main-photo-img").attr("src", imgUrl);
  });
}
