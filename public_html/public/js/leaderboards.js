$(window).on("load", function() {
  loadNavigation(4);
  console.log("TEST");
  createTable();

  $("body").on("click", "#pente-back-btn", (e) => {
    e.preventDefault(); //don't scroll up
    window.location.href = "/pente/home";
  });

});


let createTable = () => {
  $.ajax({
    url: '/pente/getTable',
    type: "POST",
    dataType: "html",
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
