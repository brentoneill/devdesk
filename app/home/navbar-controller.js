(function(){
  "use strict";

  //Main app controller//
  angular.module('devdesk')
    .controller('NavbarController', function($location, $scope, $auth){

      var navCtrl = this;

      $scope.isAuthenticated = function() {
        return $auth.isAuthenticated();
      };

      navCtrl.goTo = function(view){
        console.log('navigating to ' + view);
        $location.path('/' + view);
      }
    });
})();
