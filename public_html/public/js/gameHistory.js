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
    getGameHistory(getQueryObjects().gameId);
    $("body").on("click", "#pente-back-btn", (e) => {
      e.preventDefault(); //don't scroll up
      window.location.href = "/pente/home";
    });

  });

  let getGameHistory = (gameId) => {
    $.ajax({
      url: '/pente/getGameHistory',
      type: "POST",
      dataType: "json",
      data: {
          gameId: gameId
      },
      success: function(gameObject) {
        if (gameObject != null) {
          displayGameHistory(gameObject);
        }
      },
      error: function(err) {
          console.log('Error', err);
    }
  });
}

let displayGameHistory = (game) => {
  console.log(game);
  $("#user-white").text(game["WHITE"]);
  $("#user-black").text(game["BLACK"]);
  $("#date-started").text(game["game"]["dateStarted"]);
  $("#date-finished").text(game["game"]["dateFinished"]);
  $("#game-status").text(game["status"]);
  let moveHistory = game["game"]["moveHistory"];
  var i = 0;
  moveHistory.forEach((move) => {
    let player = move["player"];
    let color = move["color"];
    let row = move["row"];
    let column = move["column"];
    $("#move-history-table").append(
      "<tr><td>" + player +"</td><td>" + color + "</td><td>" +
      row + "</td><td>" + column + "</td></tr>");
  })
}
