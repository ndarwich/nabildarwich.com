$(function(){
  $('#navigation').load('./components/navigation.html');
});

$(window).on( "load", function() {
    $('#page-body').addClass('load-page');
});

function loadPage(p) {
  //get rid of active class for all nav bar items
  /*
  for (let i = 0; i < 4; i++) {
    $('#nav' + i).removeClass('active');
  }*/
  //load new active page
  $('#nav' + p).addClass('active');
}
