$(window).on("load", function() {
  loadNavigation(4);
  getCompletedGames();

  $("body").on("click", "#pente-back-btn", (e) => {
    e.preventDefault(); //don't scroll up
    window.location.href = "/pente/home";
  });

});

/**
 * Retrieves the game history
 */
let getCompletedGames = () => {
  $.ajax({
    url: '/pente/getCompletedGames',
    type: "GET",
    dataType: "json",
    success: function(completedGames) {
        displayGames(completedGames);
    },
    error: function(err) {
        console.log('Error', err);
    }
  });
}

let displayGames = (completedGames) => {
  console.info(completedGames);
  let completedGameIds = Object.keys(completedGames);
  completedGameIds.forEach((completedGameId) => {
    let game = completedGames[completedGameId];
    $("#completed-games-table").append(
      "<tr><td>" + completedGameId +"</td><td>" + game.winner + "</td><td>" +
      game.loser + "</td><td>" + "<div class='pente-button'><a href='/pente/gameHistory?gameId="
      + completedGameId + "'>Statistics</a></div></td></tr>");
  })
}
