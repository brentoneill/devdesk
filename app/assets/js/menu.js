$(document).ready(function(){


  /////////////////////////////////////
  //Handles Sticky Menu
  /////////////////////////////////////
  $(window).scroll(function (event) {
    var scroll = $(window).scrollTop();
    if(scroll>=48){
      $('nav').addClass('fixednav');
      $('.logo i').removeClass('fa-3x');
      $('.logo i').addClass('fa-2x');
      $('.top-link').css('height', "0px");
      $('.top-link').css('visibility', 'hidden');
    }
    if(scroll<=48){
      $('nav').removeClass('fixednav');
      $('.logo i').addClass('fa-3x');
    }
    if(scroll >= $('.header-img').height()){
      $('.top-link').css('visibility', 'visible');
      $('.top-link').css('height', "50px");
    }
  });
  /////////////////////////////////////
  /////////////////////////////////////
  /////////////////////////////////////



  /////////////////////////////////////
  //Handles Scrolling
  /////////////////////////////////////
  $('nav').on('click', 'ul li a', function(e){
    e.preventDefault();
    var loc = $(this).attr('rel');
    loc = "#" + loc;
    $('html, body').animate({
      scrollTop: ($(loc).offset().top
    )}, 800);
  });


  $('nav').on('click', '.logo a', function(e){
    e.preventDefault();
    $('html, body').animate({scrollTop: 0}, 800);
  });


  $('body').on('click', '.top-link', function(){
    $('html, body').animate({scrollTop: 0}, 800);
  })
  /////////////////////////////////////
  /////////////////////////////////////
  /////////////////////////////////////

});
