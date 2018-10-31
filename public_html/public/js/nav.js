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
      loadImage($(".displayable-photo").index(e.target));
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
  loadImage(currentlyDisplaying);
}

let navigateRight = () => {
  currentlyDisplaying += 1;
  if (currentlyDisplaying > maxIndex){
    currentlyDisplaying = 0; //wrap
  }
  loadImage(currentlyDisplaying);
}

let loadImage = (index) => {
  $("#page-overlay").load("/components/image-page.html", () => {
    if (maxIndex == -1) {
      maxIndex = $(".displayable-photo").length - 1;
    }
    $("#page-overlay").addClass("load-overlay");
    newImage = $($(".displayable-photo")[index % (maxIndex+1)]) //wrapping
    currentlyDisplaying = index;
    imgUrl = newImage.attr("src");
    imgCaption = newImage.attr("alt");
    $("#photo-caption").text(imgCaption);
    $("#main-photo-img").attr("src", imgUrl);
    insideImage = true;
  });
}

let exitImage = () => {
  $("#page-overlay").empty();
  $("#page-overlay").removeClass("load-overlay");
  insideImage = false;
  currentlyDisplaying = -1;
}
