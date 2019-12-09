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
    let queryObjects = getQueryObjects();
    console.log(queryObjects.gameId);
  createTable(queryObjects.gameId);
    $("body").on("click", "#pente-back-btn", (e) => {
      e.preventDefault(); //don't scroll up
      window.location.href = "/pente/home";
    });

  });

  let createTable = (id) => {
    $.ajax({
      url: '/pente/getGameHistory',
      type: "POST",
      dataType: "html",
      data: {
          gameId: id
      },
      success: function(data) {
          console.log('Success');
          console.log(data);
          document.getElementById("leaderboards-container").innerHTML += data;
      },
      error: function(err) {
          console.log('Error', err);
    }
  });

  }
