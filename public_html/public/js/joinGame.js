$(window).on("load", function() {
  loadNavigation(4);
  createTable();

  $("body").on("click", "#pente-back-btn", (e) => {
    e.preventDefault(); //don't scroll up
    window.location.href = "/pente/home";
  });

});


let createTable = () => {
  $.ajax({
    url: '/pente/getAvailableGames',
    type: "POST",
    dataType: "html",
    success: (availableGames) => {
        console.info(availableGames);
        if (availableGames.length <= 0) {
          $("#available-games").html("<h3>No Games Available To Display...</h3>");
        } else {
          var availableGamesTable = "<table style='width:100%'><th>Game ID</th><th>Host</th>";
          availableGames = JSON.parse(availableGames);
          availableGames.forEach((availableGame) => {
            availableGamesTable += "<tr><td>" + availableGame.id + "</td><td>" + availableGame.host + "</td></tr>";
          });
          availableGamesTable += "</table>";
          $("#available-games").html(availableGamesTable);
        }

    },
    error: function(err) {
      console.log('Error', err);
  }
});



}
