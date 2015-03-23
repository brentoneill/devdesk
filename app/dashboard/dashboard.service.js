(function () {
    "use strict";

    angular
        .module('dashboard')
        .factory('DashboardService', ['$http', '$rootScope', '$location',
        function ($http, $rootScope, $location) {

          return {
            updateStats: updateStats,
            getRecentProjects: getRecentProjects
          }


          function updateStats() {
          };

          function getRecentProjects() {
            $http.get('api/collections/projects').then(function(res){
              console.log(res);
            });

          }




        }]);
    })();
