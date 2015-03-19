(function () {
    "use strict";

    angular
        .module('projects', [
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
              .when('/projects', {
                templateUrl: 'projects/views/projects.html',
                controller: 'ProjectController as projCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              })
              .when('/projects/new', {
                templateUrl: 'projects/views/projectnew.html',
                controller: 'ProjectController as projCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              })
              .when('/projects/:projectId', {
                templateUrl: 'projects/views/projectdetail.html',
                controller: 'ProjectController as projCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              })
              .when('/projects/:projectId/documents', {
                templateUrl: 'projects/views/projectdocs.html',
                controller: 'ProjectController as projCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              })
              .when('/projects/:projectId/documents/estimate', {
                templateUrl: 'projects/views/estimate.html',
                controller: 'ProjectController as projCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              })
              .when('/projects/:projectId/edit', {
                templateUrl: 'projects/views/editproject.html',
                controller: 'ProjectController as projCtrl',
                resolve: {
                  authenticated: checkAuth
                }
              });
        });
})();
