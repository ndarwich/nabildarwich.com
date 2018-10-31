//load a navigation page and change its background
loadNavigation = (p) => {
  $("#navigation").load("/components/navigation.html", () => {
    $("#nav" + p).addClass("active");
  });
}

baseUrl = "";
numRegex = /\d+/;
insideImage = false;
currentlyDisplaying = -1;
maxIndex = -1;
$(window).on("load", function() {
    $("#page-body").addClass("load-page");
    $("body").on("click", ".displayable-photo", (e) => {
      loadImage(e.target.src);
    });
    $(document).keydown(function(e){
      if (insideImage == true) {
        e.preventDefault();
        if (e.keyCode==37 || e.keyCode == 65) {
          navigateLeft();
        } else if (e.keyCode == 39 || e.keyCode == 68) {
          navigateRight();
        }
      }
    });
    $("body").on("click", "#page-overlay", (e) => {
      //navigations do not exit out of the screen
      if ($(e.target).hasClass("navigate-img")) {
        return;
      }
      else {
        exitImage();
      }
    });
    $("body").on("click", "#navigate-left", (e) => {
      navigateLeft();
    });
    $("body").on("click", "#navigate-right", (e) => {
      navigateRight();
    });
});

let navigateLeft = () => {
  currentlyDisplaying -= 1;
  if (currentlyDisplaying < 0){
    currentlyDisplaying = maxIndex; //wrap
  }
  imgUrl = baseUrl + currentlyDisplaying + ".png";
  loadImage(imgUrl);
}

let navigateRight = () => {
  currentlyDisplaying += 1;
  if (currentlyDisplaying > maxIndex){
    currentlyDisplaying = 0; //wrap
  }
  imgUrl = baseUrl + currentlyDisplaying + ".png";
  loadImage(imgUrl);
}

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
