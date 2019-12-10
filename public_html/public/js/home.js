$(window).on("load", function() {
  loadNavigation(4);
  //request our pente username
  $.get("/pente/getPenteUsername", function(username, status) {
    if (status != "success") {
      console.info("fail");
    } else {
      console.info("success");
      $("#greeting-text").text("Greetings, " + username);
    }
    //now that we have username, request active games
    $.ajax({
      url: "/pente/getActiveGames",
      type: "POST",
      dataType: "json",
      data: {
          username: username
      },
      success: function(activeGames) {
        displayActiveGames(activeGames);
      },
      error: function(err) {
          console.log("Error", err.responseText);
      }
    });
  });
  $("body").on("click", "#pente-creategame-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    createGame();
  });
  $("body").on("click", "#pente-logout-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteLogout(e);
  });

});

let displayActiveGames = (activeGames) => {
  console.info(activeGames)
  if (activeGames == null || activeGames.length == 0) {
    $("#pente-active-games").val("You are not playing in any game currently.");
  }
  let activeGameHtml = "";
  activeGames.forEach((gameId) => {
    activeGameHtml += "<a style='color:blue' class='active-game' href='/pente/game?gameId=" + gameId + "'>" + gameId + "</a> ";
  });
  $("#pente-active-games").html(activeGameHtml);
}

let createGame = () => {
  $.get("/pente/getUniqueGameId", function(gameId, status) {
    if (status == "success") {
      console.info(gameId);
      window.location.href = "/pente/game?gameId=" + gameId;
    } else {
      console.log("error");
    }
  });
}

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
