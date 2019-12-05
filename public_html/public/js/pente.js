var socket = io.connect('http://localhost:8200');

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
        //establish a socket on successful login
        socket.emit("client-login", $("#pente-username").val());
        console.info("client login emitted")
        window.location.href = "/pente/home";
    },
    error: function(err) {
        console.log('Error', err);
  }
});



}
