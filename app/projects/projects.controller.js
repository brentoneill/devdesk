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


          projCtrl.isAuthenticated = function () {
            return $auth.isAuthenticated();
          };



          projCtrl.updateTotals = function(){
            projCtrl.project.hrsRemaining = 0;
            projCtrl.project.totalDel = 0;
            projCtrl.project.totalHrs = 0;
            $scope.projectStatus = '';
            _.each(projCtrl.project.deliverables, function(item, idx, arr){
              if(item.complete == 'no'){
                projCtrl.project.hrsRemaining += +item.hours
                projCtrl.project.totalDel++;
              }
              else{
              }
              projCtrl.project.totalHrs += +item.hours;
            });
            $scope.max = projCtrl.project.totalHrs;
            if(projCtrl.project.hrsRemaining == 0){
              $scope.projectStatus = 'Project Complete!';
            }
          }

          projCtrl.updateDeliverable = function(project){

            projCtrl.updateTotals();
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
            })
            console.log(newProject.totalHrs);
            ProjectService.createProject(newProject);
          };

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
            var html = angular.element('.contract-wrapper').html();
            ProjectService.emailContract(html, project);
          };
          projCtrl.sendReminder = function(project, type){
            console.log(project);
            console.log(type);
            ProjectService.sendReminder(project, type);
          };
      }]);

})();
