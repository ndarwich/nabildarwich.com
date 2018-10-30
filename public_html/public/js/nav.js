//load a navigation page and change its background
loadNavigation = (p) => {
  $("#navigation").load("/components/navigation.html", () => {
    $("#nav" + p).addClass("active");
  });
}

baseUrl = "";
numRegex = /\d+/;
insideImage = true;
currentlyDisplaying = -1;
maxIndex = -1;
$(window).on("load", function() {
    $("#page-body").addClass("load-page");
    $("body").on("click", ".displayable-photo", (e) => {
      console.info(e.target.src);
      loadImage(e.target.src);
    });
    $(document).keypress(function(e){
      if (insideImage == true) {
        console.info(currentlyDisplaying);
        if (e.keyCode==37) {
          currentlyDisplaying -= 1;
          if (currentlyDisplaying < 0){
            currentlyDisplaying = maxIndex; //wrap
          }
          imgUrl = baseUrl + currentlyDisplaying + ".png";
          loadImage(imgUrl);
        } else if (e.keyCode == 39) {
          currentlyDisplaying += 1;
          if (currentlyDisplaying > maxIndex){
            currentlyDisplaying = 0; //wrap
          }
          imgUrl = baseUrl + currentlyDisplaying + ".png";
          loadImage(imgUrl);
        }
      }
    });
    $("body").on("click", "#page-overlay", () => {
      exitImage();
    });
    $("body").on("click", "#page-body", () => {
      exitImage();
    });
});

let loadImage = (imgUrl) => {
  $("#page-overlay").load("/components/image-page.html", () => {
    $("#page-overlay").addClass("load-overlay");
    $("#main-photo-img").attr("src", imgUrl);
    if (insideImage == false) {
      baseUrl = imgUrl.substring(0, imgUrl.lastIndexOf("-") + 1);
      ending = imgUrl.substring(imgUrl.lastIndexOf("-") + 1);
      currentlyDisplaying = parseInt(ending.match(numRegex));
      maxIndex = $(".displayable-photo").length - 1;
      insideImage = true;
    }
  });
}

let exitImage = () => {
  $("#page-overlay").empty();
  $("#page-overlay").removeClass("load-overlay");
  insideImage = false;
  currentlyDisplaying = -1;
}
