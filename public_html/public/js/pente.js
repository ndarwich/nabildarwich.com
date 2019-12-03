$(window).on("load", function() {
  loadNavigation(4);
  $("body").on("click", "#pente-login-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteLogin(e);
  });
});

let penteLogin = (e) => {
  console.info("Login Clicked");
  console.info("Username: " + $("#pente-username").val());
  console.info("Password: " + $("#pente-password").val());
  console.info($('#pente-login-container').serialize());
  $.ajax({
    url: '/pente/login',
    type: "POST",
    dataType: "html",
    data: {
        username: $("#pente-username").val(),
        password: $("#pente-password").val()
    },
    success: function(data) {
        console.log('Success');
        window.location.href = "/pente/game";
    },
    error: function(err) {
        console.log('Error', err);
  }
});



}
