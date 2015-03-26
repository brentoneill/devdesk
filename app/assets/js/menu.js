$(document).ready(function(){


  /////////////////////////////////////
  //Handles Sticky Menu
  /////////////////////////////////////
  $(window).scroll(function (event) {
    var scroll = $(window).scrollTop();
    if(scroll>=48){
      $('nav').addClass('fixednav');
      $('.top-link').css('height', "0px");
      $('.top-link').css('visibility', 'hidden');
    }
    if(scroll<=48){
      $('nav').removeClass('fixednav');
    }
    if(scroll >= $('.header-img').height()){
      $('.top-link').css('visibility', 'visible');
      $('.top-link').css('height', "50px");
    }
  });
  /////////////////////////////////////
  /////////////////////////////////////
  /////////////////////////////////////

});
