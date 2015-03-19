(function () {
    "use strict";

    angular
        .module('projects')
        .controller('ProjectController', ['ProjectService', 'ClientService', 'Account', '$location', '$routeParams', '$auth', '$scope',
        function(ProjectService, ClientService, Account, $location, $routeParams, $auth, $scope) {

          var projCtrl = this;

         $scope.getProfile = function() {
           Account.getProfile()
             .success(function(data) {
               $scope.user = data;
              //  localStorage.setItem('user', JSON.stringify(data));
              //  $scope.user = JSON.parse(localStorage.getItem('user'));
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

         ProjectService.getProjects().success(function(projects){
           projCtrl.projects = _.where(projects, {'userId':$scope.user._id})
         });

         ProjectService.getProject($routeParams.projectId).success(function(project){
           projCtrl.project = project;
           projCtrl.updateTotals();
         });

         ClientService.getClients().success(function(clients){
           projCtrl.clients = clients;
         });

         ClientService.getClient($routeParams.clientId).success(function(client){
           projCtrl.client = client;

         });


         //////////////////////////////
         $scope.deliverablesNew = [{id: 'deliv', 'complete': 'no', 'invoiced':'no', 'realHrs': 0}];

         $scope.addNewDeliverable = function() {
           var newDeliverableNo = $scope.deliverablesNew.length+1;
            $scope.deliverablesNew.push({'id':'deliv'+newDeliverableNo, 'complete': 'no', 'invoiced':'no', 'realHrs': 0});
          };

          $scope.showAddDeliverable = function(deliverable) {
            return deliverable.id === $scope.deliverablesNew[$scope.deliverablesNew.length-1].id;
          };
          /////////////////////////////

          projCtrl.addInvoice = function(project){

          }

          projCtrl.isAuthenticated = function () {
            return $auth.isAuthenticated();
          };

          projCtrl.updateTotals = function(){
            // console.log(deliverable.realHrs);
            // console.log($scope.user.rateHr);
            // console.log(deliverable.realCost);
            projCtrl.project.hrsRemaining = 0;
            projCtrl.project.totalDel = 0;
            projCtrl.project.totalHrs = 0;
            projCtrl.project.totalRealHrs = 0;
            projCtrl.project.estCostTotal = 0;
            projCtrl.project.realCostTotal = 0;
            $scope.projectStatus = '';
            _.each(projCtrl.project.deliverables, function(item, idx, arr){
              if(item.complete == 'no'){
                projCtrl.project.hrsRemaining += +item.hours
                projCtrl.project.totalDel++;
              }
              else{
              }
              projCtrl.project.totalHrs += +item.hours;
              projCtrl.project.totalRealHrs += +item.realHrs;
              projCtrl.project.estCostTotal += +item.cost;
              projCtrl.project.realCostTotal += +item.realCost;
            });
            $scope.max = projCtrl.project.totalHrs;
            if(projCtrl.project.hrsRemaining == 0){
              $scope.projectStatus = 'Project Complete!';
            }
          }

          projCtrl.updateDeliverable = function(project, deliv){
            deliv.realCost = deliv.realHrs * $scope.user.ratehr;
            deliv.cost = deliv.hours * $scope.user.ratehr;
            projCtrl.updateEstimateTotals();
            projCtrl.updateTotals(deliv);
            projCtrl.editProject(project); //Sends data to service to save
          }

          projCtrl.updateEstimateTotals = function(){
            projCtrl.project.estimate.totalHrs = 0;
            projCtrl.project.estimate.totalAmnt = 0;
            _.each(projCtrl.project.deliverables, function(item, idx, arr){
              console.log(item);
              if(item.inEstimate === 'yes'){
                projCtrl.project.estimate.totalHrs += +item.hours;
                projCtrl.project.estimate.totalAmnt += +item.cost;
              }
            });
          };

          projCtrl.addInvoice = function(project){
            console.log('adding invoice');
            var newInvoice = {
              id : project.invoices.length + 1,
              dateCreated : Date.now(),
              sent : false,
              deliverables : []
            }
            project.invoices.push(newInvoice);
            projCtrl.editProject(project);
          }

          projCtrl.createProject = function (newProject){
            newProject.userId = $scope.user._id;
            newProject.user = $scope.user;
            newProject.deliverables = $scope.deliverablesNew;
            newProject.totalHrs = 0;
            //Init document fields
            newProject.contract = {};
            newProject.estimate = {};
            newProject.invoices = [];
            //Count total hours for project
            _.each(newProject.deliverables, function(item, idx, arr){
              newProject.totalHrs += +item.hours;
              item.estCost = item.hours * $scope.user.rateHr;
              item.realCost = item.estCost;
            })
            ProjectService.createProject(newProject);
          };

          projCtrl.createContract = function(project){
            console.log('creating contract');
            project.contractCreated='yes';
            projCtrl.editProject(project);
          };

          projCtrl.createEstimate = function(project){
            project.estimateCreated = 'yes';
            project.estimate.deliverables = [];
            project.estimate.estCost = 0;
            var allDeliverables = projCtrl.project.deliverables
            _.each(allDeliverables, function(item, idx, arr){
              if(item.inEstimate === 'yes'){
                project.estimate.deliverables.push(item);
                project.estimate.estCost += +item.cost;
              }
            });
            projCtrl.editProject(project);
          }

          projCtrl.resetEstimate = function(project){
            project.estimateCreated = 'no';
            project.estimate.deliverables = [];
            project.estimate.estCost = 0;
            projCtrl.editProject(project);
          }


          projCtrl.viewProjectDetail = function(id){
            $location.path('/projects/' + id);
          };

          projCtrl.viewClientDetail = function(id){
            $location.path('/clients/' + id);
          }

          projCtrl.editProject = function (project) {
            ProjectService.editProject(project);
            // $location.path('/projects');
          };

          projCtrl.deleteProject = function(id) {
            ProjectService.deleteProject(id);
          };

          projCtrl.goToDocuments = function(project){
            $location.path('/projects/' + project._id + '/documents')
          };

          projCtrl.emailContract = function(project){
            project.contractSendDate = Date.now();
            var html = angular.element('.contract-wrapper').html();
            ProjectService.emailContract(html, project);
            projCtrl.editProject(project);
          };
          projCtrl.emailEstimate = function(project){
            project.estimateSendDate = Date.now();
            var html = angular.element('.estimate-wrapper').html();
            ProjectService.emailEstimate(html, project);
            projCtrl.editProject(project);
          }
          projCtrl.sendReminder = function(project, type){
            ProjectService.sendReminder(project, type);
          };
      }]);

})();
