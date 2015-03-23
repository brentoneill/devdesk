(function () {
    "use strict";

    angular
        .module('dashboard', [
            'ngRoute',
        ])
        .config(function ($routeProvider) {
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
            .when('/dashboard', {
              templateUrl: 'dashboard/views/dashboard.html',
              controller: 'DashboardController as dashCtrl',
              resolve: {
                authenticated: checkAuth
              }
            });
      });
})();
