$(window).on("load", function() {
  loadNavigation(4);
  $("body").on("click", "#pente-login-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteLogin(e);
  });
  //////////////////////PENTE GAME LOADING LOGIC///////////////////
  const penteGame = new PenteGame(); //create a new pente game

  //indicate whose player's turn it is
  penteGame.playerTurn = () => {
    console.info("Clicked");
    $("#pente-player-move").text("" + penteGame.currentTurn + "'s move...");
  }

  //play again button click
  $("body").on("click", "#play-again-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteGame.playAgain();
  });
  /////////////////END PENTE GAME LOADING LOGIC///////////////////
});

let penteLogin = (e) => {
  console.info("Login Clicked");
  console.info("Username: " + $("#pente-username").val());
  console.info("Password: " + $("#pente-password").val());
}
