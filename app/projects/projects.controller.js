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

        //  $scope.timerRunning = false;
        //
        // $scope.startTimer = function () {
        //   $scope.$broadcast('timer-start');
        //   $scope.timerRunning = true;
        // };
        //
        //  $scope.stopTimer = function () {
        //     $scope.$broadcast('timer-stop');
        //     $scope.timerRunning = false;
        //  };
        //
        //  $scope.resumeTimer = function () {
        //     $scope.$broadcast('timer-resume');
        //     $scope.timerRunning = true;
        //  };


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


          projCtrl.setDeliverable = function(deliv){
            projCtrl.curDeliv = deliv;
            console.log(projCtrl.curDeliv);
          }

          projCtrl.isAuthenticated = function () {
            return $auth.isAuthenticated();
          };

          projCtrl.updateTotals = function(){
            projCtrl.project.hrsRemaining = 0;
            projCtrl.project.totalDel = 0;
            projCtrl.project.totalHrs = 0;
            projCtrl.project.totalRealHrs = 0;
            projCtrl.project.estCostTotal = 0;
            projCtrl.project.realCostTotal = 0;
            projCtrl.project.delivsEstimated = 0;
            projCtrl.project.delivsCompleted = 0;
            projCtrl.project.delivsInvoiced = 0;
            projCtrl.project.delivsPaid = 0;
            $scope.projectStatus = '';

            _.each(projCtrl.project.deliverables, function(item, idx, arr){
              if(item.complete == 'no'){
                projCtrl.project.hrsRemaining += +item.hours
                projCtrl.project.totalDel++;
              }
              if(item.complete =='yes'){
                projCtrl.project.delivsCompleted++;
              }
              if(item.realHrs == 0){
                item.velocity = 0;
              }
              if(item.invoiced === 'yes'){
                projCtrl.project.delivsInvoiced++;
              }
              if(item.paid === 'yes'){
                projCtrl.project.delivsPaid++;
              }
              if(item.inEstimate ==='yes'){
                projCtrl.project.delivsEstimated++;
              }
              if(item.realHrs >= 1){
                item.velocity = (+item.hours)/(+item.realHrs);
              }


              projCtrl.project.totalHrs += +item.hours;
              projCtrl.project.totalRealHrs += +item.realHrs;
              projCtrl.project.velocityAvg = projCtrl.project.totalHrs / projCtrl.project.totalRealHrs
              projCtrl.project.estCostTotal += +item.cost;
              projCtrl.project.realCostTotal += +item.realCost;
            });

            $scope.max = projCtrl.project.totalHrs;
            if(projCtrl.project.hrsRemaining == 0){
              $scope.projectStatus = 'Project Complete!';
            }
          };

          projCtrl.updateDeliverable = function(project, deliv){
            deliv.realCost = deliv.realHrs * $scope.user.ratehr;
            deliv.cost = deliv.hours * $scope.user.ratehr;
            projCtrl.updateEstimateTotals();
            projCtrl.updateTotals();
            projCtrl.editProject(project); //Sends data to service to save
          };

          projCtrl.updateEstimateTotals = function(){
            projCtrl.project.estimate.totalHrs = 0;
            projCtrl.project.estimate.totalAmnt = 0;
            _.each(projCtrl.project.deliverables, function(item, idx, arr){
              if(item.inEstimate === 'yes'){
                projCtrl.project.estimate.totalHrs += +item.hours;
                projCtrl.project.estimate.totalAmnt += +item.cost;
              }
            });
          };


          projCtrl.generateInvoice = function(project, i){
            project.invoices[i].invoiceGenerated = true;
            project.invoices[i].reminders = [];
            projCtrl.editProject(project);
          };

          projCtrl.deleteInvoice = function(project, i){
            project.invoices.splice(i, 1);
            projCtrl.editProject(project);
          };

          projCtrl.createInvoice = function(project){
            console.log('adding invoice');
            var newInvoice = {
              id : project.invoices.length + 1,
              dateCreated : Date.now(),
              sent : false,
              deliverables : []
            }
            project.invoices.push(newInvoice);
            projCtrl.editProject(project);
          };

          projCtrl.resetInvoice = function(project, i) {
            project.invoices[i].deliverables = [];
            project.invoices[i].totalHrs = 0;
            project.invoices[i].totalCost = 0;

            _.each(project.deliverables, function(item, idx, arr){
              item.invoiced = 'no';
            });
            project.invoices[i].invoiceGenerated = false;

            projCtrl.editProject(project);
          };


          projCtrl.addDelivToInvoice = function(project, deliv, i){
            project.invoices[i].deliverables.push(deliv);
            projCtrl.updateInvoiceTotals(project, i);
            deliv.invoiced = 'yes';
            projCtrl.editProject(project);
          };

          projCtrl.removeDelivFromInvoice = function(project, deliv, i){ //i is invoice index, j is deliverable index
            var itemInInvoice = _.findWhere(project.invoices[i].deliverables, {name: deliv.name});
            var removedIdx = _.indexOf(project.invoices[i].deliverables, itemInInvoice);
            project.invoices[i].deliverables.splice(removedIdx, 1);

            projCtrl.updateInvoiceTotals(project, i);
            deliv.invoiced ='no';
            projCtrl.editProject(project)
          };

          projCtrl.updateInvoiceTotals = function(project, i){
            project.invoices[i].totalHrs = 0;
            project.invoices[i].totalCost = 0;

            _.each(project.invoices[i].deliverables, function(item, idx, arr){
              project.invoices[i].totalHrs += +item.realHrs;
              project.invoices[i].totalCost += +item.realCost;
            });
          };

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
          };

          projCtrl.resetEstimate = function(project){
            project.estimateCreated = 'no';
            project.estimate.deliverables = [];
            project.estimate.estCost = 0;
            projCtrl.editProject(project);
          };


          // projCtrl.addAllToEstimate = function(project){
          //   console.log($scope.estimateAll);
          //   if($scope.estimateAll){
          //     _.each(project.deliverables, function(item, idx, arr){
          //       item.inEstimate = 'yes';
          //     });
          //   }
          //   else {
          //     _.each(project.deliverables, function(item, idx, arr){
          //       item.inEstimate = 'no';
          //     });
          //   }
          //   projCtrl.editProject(project);
          // }

          projCtrl.viewProjectDetail = function(id){
            $location.path('/projects/' + id);
          };

          projCtrl.viewClientDetail = function(id){
            $location.path('/clients/' + id);
          };

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

          projCtrl.emailInvoice = function(project, idx){
            project.invoices[idx].sendDate = Date.now();
            project.invoices[idx].sent = true;
            var invoiceId = '#invoice-' + idx;
            var html = angular.element(invoiceId).html();
            ProjectService.emailInvoice(html, project, idx);
            projCtrl.editProject(project);
          };

          projCtrl.sendInvoiceReminder = function(project, idx) {
            ProjectService.sendInvoiceReminder(project, idx);
          };

          projCtrl.emailContract = function(project){
            project.contractSendDate = Date.now();
            project.contractSent = true;
            var html = angular.element('.contract-wrapper').html();
            ProjectService.emailContract(html, project);
            projCtrl.editProject(project);
          };

          projCtrl.emailEstimate = function(project){
            project.estimateSendDate = Date.now();
            project.estimateSent = true;
            var html = angular.element('.estimate-wrapper').html();
            ProjectService.emailEstimate(html, project);
            projCtrl.editProject(project);
          };

          projCtrl.sendReminder = function(project, type){
            ProjectService.sendReminder(project, type);
          };
      }]);

})();
