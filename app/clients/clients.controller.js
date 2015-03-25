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

          moment.locale('en-US');

          $scope.getProfile();
          $scope.user = $.parseJSON(localStorage.getItem('user'));
          $scope.clientEditEnabled = false;

          ClientService.getClients().success(function(clients){
            cliCtrl.clients = _.where(clients, {'userId':$scope.user._id})
          });

          ClientService.getClient($routeParams.clientId).success(function(client){
            cliCtrl.client = client;
          });

          ProjectService.getProjects().success(function(projects){
            cliCtrl.cliProjects = [];
            cliCtrl.allProjects = _.where(projects, {'userId': $scope.user._id});
            _.each(cliCtrl.allProjects, function(item, idx, arr){
              if(item.client.name === cliCtrl.client.name){
                cliCtrl.cliProjects.push(item);
              }
            });

            cliCtrl.computeClientStats(cliCtrl.cliProjects);
            cliCtrl.buildAllDelivsData(cliCtrl.allProjects);
            cliCtrl.buildClientDelivsData(cliCtrl.cliProjects);
            cliCtrl.buildDelivGraph();
          });

          cliCtrl.computeClientStats = function(projects){
            cliCtrl.avgProjectCost = 0;
            cliCtrl.avgProjectHours = 0;
            cliCtrl.totalProjectsCost = 0;
            cliCtrl.totalProjectsHours = 0;
            var projectCount = 0;
            _.each(projects, function(item, idx, arr){
              cliCtrl.totalProjectsCost += +item.realCostTotal;
              cliCtrl.totalProjectsHours += +item.totalRealHrs;
              projectCount++;
            });
            cliCtrl.avgProjectCost = cliCtrl.totalProjectsCost / projectCount;
            cliCtrl.avgProjectHours = cliCtrl.totalProjectsHours /projectCount;

            cliCtrl.avgProjectsPerClient = 0;
            cliCtrl.repeatClients = 0;
            cliCtrl.mostActiveClient = {};
            _.each(cliCtrl.clients, function(client, index, array){
              client.numProjects = 0;
              _.each(cliCtrl.allProjects, function(project, index, array){
                if(client.name === project.client.name){
                  client.numProjects++;
                }
              });
              cliCtrl.avgProjectsPerClient += client.numProjects;
              cliCtrl.editClient(client);
              if(client.numProjects > 1) {
                cliCtrl.repeatClients++;
              }
            });
            cliCtrl.avgProjectsPerClient = cliCtrl.avgProjectsPerClient / cliCtrl.clients.length;
            cliCtrl.mostActiveClient = _.max(cliCtrl.clients, function(client){ return client.numProjects; });
            console.log(cliCtrl.mostActiveClient);

          }

          cliCtrl.buildAllDelivsData = function(projects){
            cliCtrl.allWeekData   = [ 0, 0, 0, 0 ];

            var todayM = moment().add('1', 'days');
            var weekAgoM = moment().subtract('7', 'days');
            var weekAgo = weekAgoM.format('YYYY-MM-DD');
            var today = todayM.format('YYYY-MM-DD');

            _.each(cliCtrl.allProjects, function(project, index, array){
              _.each(project.deliverables, function(deliv, index, array){
                if(deliv.completeDate) {
                  var dayComplete = moment(deliv.completeDate);
                  if(dayComplete.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.allWeekData[1]++;
                  }
                }
                if(deliv.invoicedDate){
                  var dayInvoiced = moment(deliv.invoicedDate);
                  if(dayInvoiced.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.allWeekData[2]++;
                  }
                }
                if(deliv.paidDate){
                  var dayPaid = moment(deliv.paidDate);
                  if(dayPaid.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.allWeekData[3]++;
                  }
                }
                if(deliv.estimateDate){
                  var dayEstimated = moment(deliv.estimateDate);
                  if(dayEstimated.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.allWeekData[0]++;
                  }
                }
              });
            });
          }

          cliCtrl.buildClientDelivsData = function(projects){
            cliCtrl.clientWeekData   = [ 0, 0, 0, 0 ];

            var todayM = moment().add('1', 'days');
            var weekAgoM = moment().subtract('7', 'days');
            var weekAgo = weekAgoM.format('YYYY-MM-DD');
            var today = todayM.format('YYYY-MM-DD');

            _.each(cliCtrl.cliProjects, function(project, index, array){
              _.each(project.deliverables, function(deliv, index, array){
                if(deliv.completeDate) {
                  var dayComplete = moment(deliv.completeDate);
                  if(dayComplete.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.clientWeekData[1]++;
                  }
                }
                if(deliv.invoicedDate){
                  var dayInvoiced = moment(deliv.invoicedDate);
                  if(dayInvoiced.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.clientWeekData[2]++;
                  }
                }
                if(deliv.paidDate){
                  var dayPaid = moment(deliv.paidDate);
                  if(dayPaid.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.clientWeekData[3]++;
                  }
                }
                if(deliv.estimateDate){
                  var dayEstimated = moment(deliv.estimateDate);
                  if(dayEstimated.isBetween('2015-03-17', '2015-03-25')){
                    cliCtrl.clientWeekData[0]++;
                  }
                }
              });
            });
          }

          cliCtrl.buildDelivGraph = function(){
            cliCtrl.delivGraphData = [ cliCtrl.clientWeekData, cliCtrl.allWeekData];
            cliCtrl.delivGraphLabels = ['Estimated', 'Complete', 'Invoiced', 'Paid'];
            cliCtrl.delivGraphSeries = [cliCtrl.client.name + "'s projects", 'All Projects'];
          }

          cliCtrl.enableClientEdit = function(){
            if($scope.clientEditEnabled){
              $scope.clientEditEnabled = false;
            }
            else {
              $scope.clientEditEnabled = true;
            }
          }

          cliCtrl.createClient = function (newClient){
            newClient.userId = $scope.user._id;
            ClientService.createClient(newClient);
          };

          cliCtrl.viewClientDetail = function(id){
            $location.path('/clients/' + id);
          };

          cliCtrl.editClient = function (client) {
            ClientService.editClient(client);
          };

          cliCtrl.deleteClient = function(id) {
            ClientService.deleteClient(id);
          }


      }]);

})();
