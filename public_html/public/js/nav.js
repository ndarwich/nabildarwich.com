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
    $("body").on("click", "#page-overlay", () => {
      exitImage();
    });
    [].forEach.call(document.querySelectorAll("img[data-src]"), (img) => {
      img.setAttribute("src", img.getAttribute("data-src"));
      img.onload = function() {
        img.removeAttribute("data-src");
      };
    });
});

let loadImage = (imgUrl) => {
  $("#page-overlay").load("/components/image-page.html", () => {
    $("#page-overlay").addClass("load-overlay");
    console.info(imgUrl);
    $("#main-photo-img").attr("src", imgUrl);
  });
}

let exitImage = () => {
  $("#page-overlay").empty();
  $("#page-overlay").removeClass("load-overlay");
}
