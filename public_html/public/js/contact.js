$(window).on("load", function() {
  loadPage(3);
});

var capchaValid = false;

function validateCapcha() {
  capchaValid = true;
}

function expireCapcha() {
  capchaValid = false;
}

function checkCapcha(e) {
  if (capchaValid) {
    return checkForm();
  }
  alert("Please prove you are human");
  return false;
}

function checkForm()
{
  var valid = true;
  try {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  	if (! re.test(document.getElementById("emaill").value)){
  		$("#emaill").val("Email?");
      $("#emaill").addClass("invalidInput");
  		valid=false;
  	}
  	if (document.getElementById("namee").value === ""){
  		$("#namee").val("Anonymous?");
      $("#namee").addClass("invalidInput");
  		valid=false;
  	}
  	if (document.getElementById("subjectt").value === ""){
  		$("#namee").val("Subject?");
      $("#namee").addClass("invalidInput");
  		valid=false;
  	}
  	if (document.getElementById("messagee").value === ""){
  		$("#messagee").val("Message Body?");
      $("#messagee").addClass("invalidInput");
  		valid=false;
  	}
  	if (! valid){
  		$("#submit-btn").val("Try Again");
      $("#submit-btn").css("background-color", "red");
  	}
  } catch (e) {
    valid = false;
    console.error(e);
  }
	return valid;
}
