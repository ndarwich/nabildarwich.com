
$(window).on("load", function() {
  loadNavigation(4);
  $("body").on("click", "#pente-login-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteLogin(e);
  });
  $("body").on("click", "#pente-joingame-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteJoinGame($("#pente-gameid-input").val());
  });
  $("body").on("click", "#pente-back-btn", (e) => {
    e.preventDefault(); //don't scroll up
    window.location.href = "/pente/home";
  });
});

let penteLogin = (e) => {
  console.info("Login Clicked");
  console.info("Username: " + $("#pente-username").val());
  console.info("Password: " + $("#pente-password").val());
  console.info($('#pente-container').serialize());
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
        console.info("client login emitted")
        window.location.href = "/pente/home";
    },
    error: function(err) {
        console.log('Error', err);
  }
});
}

let penteJoinGame = (gameId) => {
  console.info("Game Id", gameId);
  $.ajax({
    url: "/pente/getGameStatus",
    type: "POST",
    dataType: "html",
    data: {
        gameId: gameId
    },
    success: function(data) {
      console.info(data);
      $("#server-response").text(data);
      //window.location.href = "/pente/game";
    },
    error: function(err) {
        console.log("Error", err);
    }
  });
}
