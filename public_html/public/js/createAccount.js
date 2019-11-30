$(window).on("load", function() {
  loadNavigation(4);
  $("body").on("click", "#pente-submit-btn", (e) => {
    e.preventDefault(); //don't scroll up
    penteSubmit(e);
  });
});

let penteSubmit = (e) => {
  console.info("Login Clicked");
  console.info("Username: " + $("#pente-username").val());
  console.info("Password: " + $("#pente-password").val());
  console.info($('#pente-login-container').serialize());
  $.ajax({
    url: '/createAccount',
    type: "POST",
    dataType: "html",
    data: {
        username: $("#pente-username").val(),
        password: $("#pente-password").val()
    },
    success: function(data) {
        console.log('Success');
    },
    error: function(err) {
        console.log('Error', err);
  }
});
}
