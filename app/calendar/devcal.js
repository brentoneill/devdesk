(function () {
    "use strict";

    angular
        .module('devcal', [
            "ngRoute"
        ])
        .config(function($routeProvider) {
          var checkAuth = function ($q, $location, $auth) {
            var dfd = $q.defer();
            if(!$auth.isAuthenticated()) {
              $location.path('/login');
            } else {
              dfd.resolve();
            }
            return dfd.promise;
          };
            $routeProvider
              .when('/calendar', {
                templateUrl: 'devcal/views/fullcalendar.html',
                controller: 'CalendarController as calCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              });
        });
})();
