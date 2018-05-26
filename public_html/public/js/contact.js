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
  e.preventDefault();
  if (capchaValid) {
    return formSubmitted();
  }
  alert("Please prove you are human");
  return false;
}

function formSubmitted()
{
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var valid = true;
	if (! re.test(document.getElementById("email").value)){
		document.getElementById("emaill").innerHTML = "Valid emails only! Enter a valid email pleaseeeeee:";
		valid=false;
	}
	if (document.getElementById("name").value == ""){
		document.getElementById("namee").innerHTML = "Okay, stranger, enter some name:";
		valid=false;
	}
	if (document.getElementById("subject").value == ""){
		document.getElementById("subjectt").innerHTML = "Telling me what you will talk about will be helpful:";
		valid=false;
	}
	if (document.getElementById("message").value == ""){
		document.getElementById("messagee").innerHTML = "I think you forgot something:";
		valid=false;
	}
	if (! valid){
		document.getElementById("submitt").value = "Try Again";
	}
	return valid;
}
