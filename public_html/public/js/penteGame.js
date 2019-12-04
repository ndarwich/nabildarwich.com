var socket = io.connect('http://localhost:8200');
socket.on('connect', function(data) {
   console.log('Player connected!', socket.id);
  socket.emit('join', 'Hello World from client');
});

socket.on('client-connected', function(player) {
  console.log("Player joined with id " + player);
});

//setInterval(function() {
//  socket.emit('movement', "5");
//}, 1000 / 60);

$(window).on("load", function() {
  loadNavigation(4);
  $("body").on("click", "#pente-login-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteLogin(e);
  });
  //////////////////////PENTE GAME LOADING LOGIC///////////////////
  const penteGame = new PenteGame(); //create a new pente game

  socket.on('piece-played', function(pieceplayed) {
    if(socket.id != pieceplayed.clientid){
  var piece = $(penteGame.getPiece(pieceplayed.row, pieceplayed.col));
  penteGame.flipColor(piece);
    piece.addClass("color");
    piece.addClass(penteGame.currentTurn); //readd the current color just in case
    piece.removeClass("shadow");
    piece.removeClass("available");
    piece.data("state", pieceplayed.opposingplayer); //update the piece state

    }
    console.log(pieceplayed.pieceinfo + " with socket id " + pieceplayed.clientid);
  //  console.log(piece.id);
  });

  socket.on('state', function(players) {
    console.log(players);
  });

  socket.on('clearPiece', function(piece) {
    var piece = $(penteGame.getPiece(piece.row, piece.col));
    penteGame.flipColor(piece);
  });

  //indicate whose player's turn it is
  penteGame.playerTurn = () => {
    console.info("Clicked");
    $("#pente-player-move").text("" + penteGame.currentTurn + "'s move...");
  }

  //initialize socket related functions
  penteGame.pieceMoved = function(piece) {
    socket.emit("movement", [piece.data("row"), piece.data("column"), piece.data("state"), piece]);
  }
  penteGame.pieceCleared = function(piece) {
    socket.emit("clearpiece", [piece.data("row"), piece.data("column")]);
  }

  //play again button click
  $("body").on("click", "#play-again-btn", (e) => {
    e.preventDefault(); //don"t scroll up
    penteGame.playAgain();
  });
  /////////////////END PENTE GAME LOADING LOGIC///////////////////
  $("body").on("click", "#pente-back-btn", (e) => {
     socket.emit('client_disconnected', "Client has left room");
    e.preventDefault(); //don't scroll up
    window.location.href = "/pente/home";
  });
});


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
        newCol.attr('id', rowNumber+""+colNumber);
        newRow.append(newCol);
      }
      board.append(newRow);
    }
    this.playerTurn(); //indicate whose turn it is
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
      //console.info("left piece");
      if (game.isDone) {
        return; //do nothing if game is done
      }
      //undo what entering a piece does
      let piece = $(event.target);
      piece.removeClass("shadow");
      piece.removeClass(game.currentTurn);
    });
    //the mouse click listener, makes a move
    board.on("click", ".available.piece", () => {
      //console.info("available piece clicked");
      if (game.isDone) {
        return; //do nothing if game is done
      }
      //place a piece; remove the available and shadow classes
      let piece = $(event.target);
      piece.addClass("color");
      piece.addClass(game.currentTurn); //readd the current color just in case
      piece.removeClass("shadow");
      piece.removeClass("available");
      piece.data("state", game.currentTurn); //update the piece state
      this.pieceMoved(piece);
      //apply Othello game logic
      game.checkColorsToFlip(piece.data("row"), piece.data("column"), piece.data("state"));
      //check if five in a row achieved
      game.checkIfWin(piece.data("row"), piece.data("column"), piece.data("state"));
      //change turns if game is not over
      if (! game.isDone) {
        game.currentTurn = game.currentTurn == "WHITE" ? "BLACK" : "WHITE";
        this.playerTurn();
      }
    });
  }

  /**
   * Helper function to flip an existing piece's color
   */
  flipColor(existingPiece) {
    let currentColor = existingPiece.data("state");
    if (currentColor != "WHITE" && currentColor != "BLACK") {
      return;
    }
    let newColor = "available";
    existingPiece.data("state", newColor);
    existingPiece.removeClass(currentColor);
    existingPiece.removeClass("color");
    existingPiece.addClass(newColor);
    existingPiece.addClass("shadow");
  }

  /**
   * Helper function to flip other piece's colors in a spectific direction;
   */
  flipColorsInDirection(row, col, color, xOffset, yOffset) {
    let multiplier = 1;
    let numOppositePieces = 0;
    //traverse until we are out of bounds/the stopping conditions are met
    while (row + yOffset*multiplier >= 0 && row + yOffset*multiplier < this.NUM_ROWS &&
           col + xOffset*multiplier >= 0 && col + xOffset*multiplier < this.NUM_COLS) {
      let existingPiece = $(this.getPiece(row + yOffset*multiplier, col + xOffset*multiplier));
      if ($(existingPiece).hasClass("available") || $(existingPiece).hasClass(color)) {
        if (numOppositePieces == 2 && $(existingPiece).hasClass(color)) {
          //these are the pieces in between
          let piece1 = $(this.getPiece(row + yOffset*1, col + xOffset*1));
          let piece2 = $(this.getPiece(row + yOffset*2, col + xOffset*2));
          this.pieceCleared(piece1);
          this.pieceCleared(piece2);
          this.flipColor(piece1);
          this.flipColor(piece2);
        }
        return;
      }
      numOppositePieces++;
      //do not flip colors if more than 2 opposite pieces are in between
      if (numOppositePieces > 2) {
        return;
      }
      //increment the multiplier
      multiplier++;
    }
  }

  /**
   * Helper function to traverse a board, backtracking if the condition for flipping is met.
   */
  traverseBoard(row, col, color, xOffset, yOffset, flip) {
    //when it comes to stopping the traversal, either a piece has to be empty or the same colorif we're flipping
    //or be either empty or a different color if we're checking for a winner
    let additionalStoppingCondition = flip ? color : color == "WHITE" ? "BLACK" : "WHITE";
    let multiplier = 1;
    let piecesInARow = 0; //the number of pieces in a row is initially 1 + traversed pieces
    //traverse until we are out of bounds/the stopping conditions are met
    while (row + yOffset*multiplier >= 0 && row + yOffset*multiplier < this.NUM_ROWS &&
           col + xOffset*multiplier >= 0 && col + xOffset*multiplier < this.NUM_COLS) {
      let existingPiece = $(this.getPiece(row + yOffset*multiplier, col + xOffset*multiplier));
      if ($(existingPiece).hasClass("available") || $(existingPiece).hasClass(additionalStoppingCondition)) {
        //OTHELLO: flip colors only if the same color on the other end
        if (flip && $(existingPiece).hasClass(additionalStoppingCondition)) {
          this.flipColorsInDirection(row, col, color, xOffset, yOffset)
        }
         break;
      }
      //increment the multiplier and piecesInARow
      piecesInARow++;
      multiplier++;
    }
    return piecesInARow;
  }

  /**
   * Helper function to traverse a board in all directions
   */
  traverseAllDirections(row, col, color, flip) {
    let east = this.traverseBoard(row, col, color, 1, 0, flip); //to the east
    let north = this.traverseBoard(row, col, color, 0, 1, flip); //to the north
    let west = this.traverseBoard(row, col, color, -1, 0, flip); //to the west
    let south = this.traverseBoard(row, col, color, 0, -1, flip); //to the south
    let northEast = this.traverseBoard(row, col, color, 1, 1, flip); //to the northeast
    let northWest = this.traverseBoard(row, col, color, -1, 1, flip); //to the northwest
    let southEast = this.traverseBoard(row, col, color, 1, -1, flip); //to the southeast
    let southWest = this.traverseBoard(row, col, color, -1, -1, flip); //to the southwest
    //if checking for winning
    if (!flip) {
      //1 is added to include the current piece
      let horizontalPieces = 1 + east + west;
      let verticalPieces = 1 + north + south;
      let diagonalOnePieces = 1 + northEast + southWest;
      let diagonalTwoPieces = 1 + northWest + southEast;
      let maxInARow = Math.max(horizontalPieces, verticalPieces, diagonalOnePieces, diagonalTwoPieces);
      if (maxInARow >= 5) {
        this.isDone = true;
        alert(color + " won with " + maxInARow + " in a row!\nCongratulations " + color + "!!");
      }
    }
  }

  /**
   * Pente Logic to check if opponent pieces can be removed from board.
   */
  checkColorsToFlip(row, column, color) {
    this.traverseAllDirections(row, column, color, true);
  }

  /**
   * Game logic to end when 5 in a row is met.
   */
  checkIfWin(row, column, color) {
    this.traverseAllDirections(row, column, color, false);
  }

  /**
   * Restart game logic.
   */
  restart () {
    this.initializeGame();
    this.playerTurn();
  }
}
