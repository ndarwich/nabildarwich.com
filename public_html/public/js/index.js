$(window).on("load", function() {
  loadNavigation(0);
  let storedCookie = document.cookie;
  let myNumber = -1;
  $.get("/numVisitors", function(data, status){
    myNumber = data;
    if (storedCookie == null || storedCookie === "") {
      $("#myNumberSpan").text(myNumber);
      document.cookie = "magicCookie=" + myNumber;
    } else {
      $("#myNumberSpan").text(document.cookie.substr(12));
    }
    $("#numVisitorsSpan").text(myNumber);
  });
});
