
angular.module('devdesk', [
    'ngMessages',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'mgcrea.ngStrap',
    'auth',
    'profile',
    'posts'])
  .config(function($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'home/views/home.html',
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
  });
