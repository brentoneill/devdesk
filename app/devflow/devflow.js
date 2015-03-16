(function () {
    "use strict";

    angular
        .module('devlow', [
            'ngRoute',
            'projects',
            'clients'
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
            .when('/devflow/start', {
              templateUrl: 'devflow/views/devflow-start.html',
              controller: 'DevFlow Controller as devfCtrl',
              resolve: {
                authenticated: checkAuth
              }
            })
          $routeProvider
            .when('/devflow/start', {
              templateUrl: 'devflow/views/devflow-start.html',
              controller: 'DevFlow Controller as devfCtrl',
              resolve: {
                authenticated: checkAuth
              }
            })
        });
})();
