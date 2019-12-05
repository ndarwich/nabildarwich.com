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

  $("body").on("click", "#pente-logout-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteLogout(e);
  });

});

let penteLogout = () => {
  $.ajax({
    url: '/pente/logout',
    type: "POST",
    dataType: "html",
    success: function(data) {
            window.location.href = "/pente";
    },
    error: function(err) {
        console.log('Error', err);
  }
});
}
