$(window).on("load", function() {
  loadNavigation(1);
  let pageURL = window.location.href;
  if (pageURL.includes("overview")) {
    loadItem(0);
  } else if (pageURL.includes("faq")) {
    loadItem(1);
  } else {
    loadItem(0);
  }
});

loadItem = function (itemId) {
  switch (itemId) {
    case 0:
      $("#page-body").load("/pages/overview.html", loadPhotos);
      $("#page-body").css("opacity", 1);
      break;
    case 1:
      $("#page-body").load("/pages/faq.html", loadPhotos);
      $("#page-body").css("opacity", 1);
      break;
    default:
      break;
  }
};

loadPhotos = function() {
  [].forEach.call(document.querySelectorAll("img[data-src]"), (img) => {
    img.setAttribute("src", img.getAttribute("data-src"));
    img.onload = function() {
      img.removeAttribute("data-src");
    };
  });
}
