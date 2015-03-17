(function () {
    "use strict";

    angular
        .module('clients', [
            "ngRoute"
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
              .when('/clients', {
                templateUrl: 'clients/views/clients.html',
                controller: 'ClientController as cliCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              })
              .when('/clients/new', {
                templateUrl: 'clients/views/newclient.html',
                controller: 'ClientController as cliCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              })
              .when('/clients/:clientId', {
                templateUrl: 'clients/views/clientdetail.html',
                controller: 'ClientController as cliCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              });
              // .when('/clients/:clientId/edit', {
              //   templateUrl: 'clients/views/editclient.html',
              //   controller: 'ClientController as cliCtrl',
              //   resolve: {
              //     authenticated: checkAuth
              //   }
              // });
        });
})();
