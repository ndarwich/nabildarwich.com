console.log("hello");
//, { origins: '*:*' }
var socket = io.connect("http://nabild.com:80/", { enabledTransports: ['ws', 'wss', 'websocket',
  'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']});
console.log("Created socket");
console.log(socket);

//helper function to get query params
let getQueryObjects = () => {
    let queryObjects = {};
    //if there is no query object
    if (window.location.href.indexOf('?') == -1) {
      return {};
    }
    //else, parse the query object
    let queryParams = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    queryParams.forEach((queryParam) => {
      let queryObject = queryParam.split('=');
      queryObjects[queryObject[0]] = queryObject[1];
    });
    return queryObjects;
  };

$(window).on("load", function() {
  loadNavigation(4);
  var creatingGame = true;

  //request our pente username
  $.get("/pente/getPenteUsername", function(username, status) {
    //register the socket with the client username
    socket.emit("client-login", username); //link socket io and our username
    let queryObjects = getQueryObjects();
    //IN THE CASE OF CREATING A NEW GAME without any query params
    if (queryObjects.gameId == null || queryObjects.gameId == {}) { //if there are no query objects, this is a new game
      //now that we have a username we can request a unique game id
      $.get("/pente/getUniqueGameId", function(gameId, status) {
        $("#game-title").text("Game " + gameId);
        socket.emit("join-game", gameId);
        $("#pente-game-placeholder").text("Waiting on second player; game id is " + gameId);
      })
    } else { //creating/joining a game with query params
      $("#game-title").text("Game " + queryObjects.gameId);
      console.info("Joining Game");
      //now that we have a username we can request a unique game id
      console.info(queryObjects.gameId);
      socket.emit("join-game", queryObjects.gameId);
      $("#pente-game-placeholder").text("Waiting on second player; game id is " + queryObjects.gameId);
    }
    //if we receive a signal to start the game
    socket.on("game-started", function(gameInfo) {
      $("#pente-game-placeholder").text("");
      //we can start the game!
      loadPenteGame(queryObjects.gameId, gameInfo, username);
    });
  });
  /////////////////END PENTE GAME LOADING LOGIC///////////////////
  $("body").on("click", "#pente-back-btn", (e) => {
    //socket.emit("client_disconnected", "Client has left room");
    e.preventDefault(); //don't scroll up
    window.location.href = "/pente/home";
  });
});

var loadPenteGame = (gameId, gameInfo, username) => {
  console.info("Game ID: " + gameId);
  //////////////////////PENTE GAME LOADING LOGIC///////////////////
  let penteGame = new PenteGame(); //create a new pente game
  //store our color to only play when it's our turn for the client
  penteGame.myColor = gameInfo["WHITE"] == username ? "WHITE" : "BLACK";
  penteGame.gameInfo = gameInfo;
  //indicate whose player"s turn it is using their username
  penteGame.playerTurn = () => {
    var moveText = penteGame.currentTurn == penteGame.myColor ?
      "Your move..." : gameInfo[penteGame.currentTurn] + "'s move...";
    $("#pente-player-move").text(moveText);
  }
  penteGame.playerTurn();
  ///////////////////////SOCKET LOGIC//////////////////////////////
  //a piece was played
  socket.on("piece-played", function(pieceLocation) {
    var piece = $(penteGame.getPiece(pieceLocation.row, pieceLocation.column));
    penteGame.clearPiece(piece);
    piece.addClass("color");
    piece.addClass(penteGame.currentTurn); //readd the current color just in case
    piece.removeClass("shadow");
    piece.removeClass("available");
    piece.data("state", penteGame.currentTurn); //update the piece state
    if (! penteGame.isDone) {
      //flip whose turn it is
      penteGame.currentTurn = penteGame.currentTurn == "WHITE" ? "BLACK" : "WHITE";
      //display the correct name's turn
      penteGame.playerTurn();
    }
  });

  //move history
  socket.on("move-history", function(moveHistory) {
    console.info(moveHistory);
  });

  //the timer
  socket.on("tik-tok", function(timeLeft) {
    if (timeLeft == 60) {
      $("#timer").text("1:00");
    } else if (timeLeft < 10) {
      $("#timer").text("0:0" + timeLeft);
    } else {
      $("#timer").text("0:" + timeLeft);
    }
  });

  //when the game is done, emit the message that was sent by the server
  socket.on("game-over", function(message) {
    alert(message);
    penteGame.isDone = true;
  });

  //when a piece should be cleared from the game
  socket.on("piece-cleared", function(piece) {
    console.info("Piece Cleared")
    var piece = $(penteGame.getPiece(piece.row, piece.column));
    penteGame.clearPiece(piece);
  });

  //initialize socket related functions
  penteGame.pieceMoved = function(piece) {
    console.info("Emitted piece-moved");
    //client side checking of whose turn it is before moving a piece (redone on server side)
    if (penteGame.currentTurn == penteGame.myColor) {
      socket.emit("piece-moved", {row: piece.data("row"), column: piece.data("column") });
    } else {
      alert("It's currently " + gameInfo[penteGame.currentTurn] + "'s move");
    }
  }

  //play again button click
  $("body").on("click", "#play-again-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteGame.playAgain();
  });
}

/**
 * Class with Pente game logic.
 */
class PenteGame {
  /**
   * Constructor.
   */
  constructor() {
    this.NUM_ROWS = 19;
    this.NUM_COLS = 19;
    this.currentTurn = "WHITE";
    this.isDone = false;
    this.playerTurn = () => {};
    this.pieceMoved = (piece) => {};
    this.pieceCleared = (piece) => {};
    this.gameInfo = {};
    this.myColor = "";
    this.initializeGame();
    this.listenToInputs();
  }

  /**
   * Initializes the grid and inner fields.
   */
  initializeGame() {
    const board = $("#pente-game");
    this.gameDone = false;
    this.currentTurn = "WHITE";
    for (let rowNumber = 0; rowNumber < this.NUM_ROWS; rowNumber++) {
      let newRow = $("<div>");
      for (let colNumber = 0; colNumber < this.NUM_COLS; colNumber++) {
        let newCol = $("<div>"); //a column is just a nested div in a row
        newCol.attr("data-row", rowNumber);
        newCol.attr("data-column", colNumber);
        newCol.data("row", rowNumber);
        newCol.data("column", colNumber);
        newCol.data("state", "available");
        newCol.addClass("piece available");
        newCol.attr("id", rowNumber+""+colNumber);
        newRow.append(newCol);
      }
      board.append(newRow);
    }
    this.playerTurn(); //update whose turn it is
  }

  //Helper functions
  /**
   * Gets a piece on the board.
   */
  getPiece(rowNumber, colNumber) {
    return $(".piece[data-row=" + rowNumber + "][data-column=" + colNumber + "]")[0];
  }

  /**
   * Input Listener for mouse enter/leave/click events.
   */
  listenToInputs() {
    let board = $("#pente-game");
    const game = this;
    //the mouse enter listener when we hover over an available piece
    board.on("mouseenter", ".available.piece", (event) => {
      //console.info("available piece entered");
      if (game.isDone) {
        return; //do nothing if game is done
      }
      let piece = $(event.target);
      piece.addClass("shadow");
      piece.addClass(game.currentTurn);
    });
    //the mouse leave listener after we leave an available piece
    board.on("mouseleave", ".available.piece", (event) => {
      //undo what entering a piece does
      let piece = $(event.target);
      piece.removeClass("shadow");
      piece.removeClass(game.currentTurn);
    });
    //the mouse click listener, makes a move
    board.on("click", ".available.piece", () => {
      console.info("available piece moved");
      //console.info("available piece clicked");
      if (game.isDone) {
        return; //do nothing if game is done
      }
      //place a piece; remove the available and shadow classes
      let piece = $(event.target);
      //let the server take care of piece moved logic
      this.pieceMoved(piece);
    });
  }

  /**
   * Helper function to flip an existing piece's color
   */
  clearPiece(existingPiece) {
    let currentColor = existingPiece.data("state");
    if (currentColor != "WHITE" && currentColor != "BLACK") {
      return;
    }
    let cleared = "available";
    existingPiece.data("state", cleared);
    existingPiece.removeClass(currentColor);
    existingPiece.removeClass("color");
    existingPiece.addClass(cleared);
    existingPiece.addClass("shadow");
  }

  /**
   * Restart game logic.
   */
  restart () {
    this.initializeGame();
    this.playerTurn();
  }
}
