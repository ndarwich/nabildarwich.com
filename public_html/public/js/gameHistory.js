$(window).on("load", function() {
  loadNavigation(4);
  getGameHistory();

  $("body").on("click", "#pente-back-btn", (e) => {
    e.preventDefault(); //don't scroll up
    window.location.href = "/pente/home";
  });

});

/**
 * Retrieves the game history
 */
let getGameHistory = () => {
  $.ajax({
    url: '/pente/getGameHistory',
    type: "GET",
    dataType: "json",
    success: function(data) {
        displayGames(gameHistory);
    },
    error: function(err) {
        console.log('Error', err);
    }
  });
}

let displayGames = (gameHistory) => {

}
