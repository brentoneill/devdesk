
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
