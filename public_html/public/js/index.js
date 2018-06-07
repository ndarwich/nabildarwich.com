$(window).on("load", function() {
  loadNavigation(0);
  let storedCookie = $.cookie("magicCookie");
  let myNumber = -1;
  $.get("/numVisitors", function(data, status){
    myNumber = data;
    //new visitors, therefore total visitors = this visitor's spot
    if (storedCookie == null || storedCookie === "") {
      $("#myNumberSpan").text(myNumber.toLocaleString());
      let inTenYears = new Date();
      inTenYears.setDate(inTenYears.getDate() + 3652); //3652 days are added
      $.cookie("magicCookie", "" + myNumber, { expires: inTenYears, path: "/"});
    } else {
      //previous visitor, therefore this visitor's spot = saved cookie
      $("#myNumberSpan").text($.cookie("magicCookie").toLocaleString());
    }
    //num visitors = get request output no matter what
    $("#numVisitorsSpan").text(myNumber.toLocaleString());
  });
});
