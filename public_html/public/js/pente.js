$(window).on("load", function() {
  loadNavigation(4);
  $("body").on("click", "#pente-login-btn", (e) => {
    e.preventDefault(); //don't scroll up
    penteLogin(e);
  });
});

let penteLogin = (e) => {
  console.info("Login Clicked");
  console.info("Username: " + $("#pente-username").val());
  console.info("Password: " + $("#pente-password").val());
}
