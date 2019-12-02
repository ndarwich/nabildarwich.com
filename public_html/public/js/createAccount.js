$(window).on("load", function() {
  loadNavigation(4);
  $("body").on("click", "#pente-submit-btn", (e) => {
    e.preventDefault(); //don't scroll up
    var bool = inputValidation(e);
    if (bool == false){
      return;
    }
    penteSubmit(e);
  });
});


 let inputValidation = (e) => {
  console.info(e);
  var usernameregex = /^[a-zA-Z0-9]{5,}$/;
  var passwordregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  var username = $("#pente-username").val();
  var password = $("#pente-password").val();
  var reenteredpassword = $("#pente-reentered-password").val();
  //hide the errors, showing them only when a criterion is not met
  $("#username-criteria-error").css("display", "none");
  $("#password-criteria-error").css("display", "none");
  $("#password-match-error").css("display", "none");
  console.info("Input val " + reenteredpassword);
  if (!username.match(usernameregex)){
    console.info("Username contained illegal characters or did not meet length requirements");
    $("#username-criteria-error").css("display", "block");
    return false;
  }
  if (!password.match(passwordregex)){
    console.info("Password does not meet requirements");
    $("#password-criteria-error").css("display", "block");
    return false;
  }
  else if (!(password === reenteredpassword)) {
    console.info("Passwords dont match!");
    $("#password-match-error").css("display", "block");
    return false;
  }
}

let penteSubmit = (e) => {
  console.info("Login Clicked");
  console.info("Username: " + $("#pente-username").val());
  console.info("Password: " + $("#pente-password").val());
  console.info($('#pente-login-container').serialize());
  $.ajax({
    url: '/createAccount',
    type: "POST",
    dataType: "html",
    data: {
        username: $("#pente-username").val(),
        password: $("#pente-password").val(),
        reenteredpassword: $("#pente-reentered-password").val()
    },
    success: function(data) {
        console.log('Success');
    },
    error: function(err) {
        console.log('Error', err);
        var err2 = JSON.parse(err.responseText);
        window.alert(err2.message);
  }
});
}
