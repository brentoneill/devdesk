(function () {
    "use strict";

    angular
        .module('clients')
        .controller('ClientController', ['ClientService', 'ProjectService', 'Account', '$location', '$routeParams', '$auth', '$scope', '$http',
        function(ClientService, ProjectService, Account, $location, $routeParams, $auth,  $scope, $http) {
          var cliCtrl = this;

          $scope.getProfile = function() {
            Account.getProfile()
              .success(function(data) {
                $scope.user = data;
              })
              .error(function(error) {
                $alert({
                  content: error.message,
                  animation: 'fadeZoomFadeDown',
                  type: 'material',
                  duration: 3
                });
              });
          };

          $scope.getProfile();

          ClientService.getClients().success(function(clients){
            cliCtrl.clients = _.where(clients, {'userId':$scope.user._id})
          });

          ClientService.getClient($routeParams.clientId).success(function(client){
            cliCtrl.client = client;
            console.log(cliCtrl.client);
          });

          ProjectService.getProjects().success(function(projects){
            cliCtrl.projects = _.where(projects, {'userId': $scope.user._id});
            cliCtrl.client.projects = [];
            console.log(cliCtrl.client.projects);
          });

          cliCtrl.createClient = function (newClient){
            newClient.userId = $scope.user._id;
            ClientService.createClient(newClient);
          };

          cliCtrl.viewClientDetail = function(id){
            $location.path('/clients/' + id);
          };

          cliCtrl.editClient = function (client) {
            ClientService.editClient(client);
            $location.path('/clients');
          };

          cliCtrl.deleteClient = function(id) {
            ClientService.deleteClient(id);
          }


      }]);

})();
