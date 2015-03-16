(function () {
    "use strict";

    angular
        .module('clients')
        .factory('ClientService', ['$http', '$rootScope', '$location', function ($http, $rootScope, $location) {

          return {
            getClients: getClients,
            getClient: getClient,
            createClient: createClient,
            editClient: editClient,
            deleteClient: deleteClient
          }


          function getClients(){
            return $http.get('/api/collections/clients');
          }

          function getClient(clientId){
            return $http.get('api/collections/clients/' + clientId);
          }

          function createClient(newClient) {
            $http.post('api/collections/clients', newClient).then(function(res){
              $rootScope.$broadcast('client:added');
              $location.path('/clients');
            });
          }

          function editClient(client) {
            $http.put('api/collections/clients/' + client._id, client).then(function(res){
              $rootScope.$broadcast('client:updated');
            });
          }

          function deleteClient(clientId){
            $http.delete('api/collections/clients/' + clientId).then(function(res){
              $rootScope.$broadcast("client:deleted");
              $location.path('/clients');
            });
          }


      }]);
})();
