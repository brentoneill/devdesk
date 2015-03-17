
var app = angular.module('devdesk', [
    'ngMessages',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'mgcrea.ngStrap',
    'ui.bootstrap',
    'ui.router',
    'auth',
    'profile',
    'clients',
    'projects',
     'devcal',
    // 'dashboard',
    // 'posts'
    ])
  .config(function($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'home/views/home.html',
        controller: 'NavbarController as navCtrl'
      })
      .when('/developer-map', {
        templateUrl: 'home/views/devmap.html',
      })
      .when('/developer-list', {
        templateUrl: 'home/views/devlisting.html',
      })
      .when('/not-found', {
        templateUrl: 'home/views/not-found.html',
      })
      .otherwise({
        redirectTo: '/not-found'
      })
    })
    .constant('_', _);


    // In app.js or main.js or whatever:
    // var myApp = angular.module('askchisne', ['ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui.bootstrap.tpls']);

    // This filter makes the assumption that the input will be in decimal form (i.e. 17% is 0.17).
    app.filter('percentage', ['$filter', function ($filter) {
      return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
      };
    }]);
