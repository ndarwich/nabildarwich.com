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
  var reenteredpassword = $("#pente-renetered-password").val();
  console.info("Input val " + reenteredpassword);
  if (!username.match(usernameregex)){
    console.info("Username contained illegal characters or did not meet length requirements");
    window.alert("Username contained illegal characters or did not meet length requirements");
    return false;
  }
  if (!password.match(passwordregex)){
    console.info("Password cdoes not meet requirements");
    window.alert("Password should contain at least one digit"
            + "one upper and lower case character, and be 8 characters long");
    return false;
  }
  else if (!(password === reenteredpassword)){
    window.alert("Passwords do not match!");
    console.info("Passwords dont match!");
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
        reenteredpassword: $("#pente-renetered-password").val()
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
