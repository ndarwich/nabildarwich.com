$(window).on("load", function() {
  loadNavigation(4);
  //request our pente username
  $.get("/pente/getPenteUsername", function(data, status) {
    if (status != "success") {
      console.info("fail");
    } else {
      console.info("success");
      $("#greeting-text").text("Greetings, " + data);
    }
  });

});
