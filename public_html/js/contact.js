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
    return true;
  }
  alert("Please prove you are human");
  return false;
}
