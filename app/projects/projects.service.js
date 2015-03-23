(function () {
    "use strict";

    angular
        .module('projects')
        .factory('ProjectService', ['$http', '$rootScope', '$location', function ($http, $rootScope, $location) {

          return {
            getProjects: getProjects,
            getProject: getProject,
            createProject: createProject,
            editProject: editProject,
            deleteProject: deleteProject,
            emailContract: emailContract,
            emailInvoice: emailInvoice,
            emailEstimate: emailEstimate,
            sendReminder : sendReminder,
            sendInvoiceReminder: sendInvoiceReminder
          }


          function getProjects(){
            return $http.get('api/collections/projects');
          }

          function getProject(projectId){
            return $http.get('api/collections/projects/' + projectId);
          }

          function createProject(newProject) {
            newProject.contract = {};
            newProject.estimate = {};
            newProject.invoices = [];
            newProject.contract.reminders = []
            newProject.estimate.reminders = [];
            $http.post('api/collections/projects', newProject).then(function(res){
              $rootScope.$broadcast('project:added');
              $location.path('/projects');
            });
          }

          function editProject(project) {
            $http.put('api/collections/projects/' + project._id, project).then(function(res){
              $rootScope.$broadcast('project:updated');
            });
          }

          function deleteProject(projectId){
            $http.delete('api/collections/projects/' + projectId).then(function(res){
              $rootScope.$broadcast("project:deleted");
              $location.path('/projects');
            });
          }

          function emailInvoice(html, project, idx){
            console.log('service sending invoice');
            var request = [html, project, idx];
            $http.post('/send-invoice', request).then(function(res){
              $rootScope.$broadcast("document:sent");
              $location.path('/projects/' + project._id + '/documents');
            });
          }
          function emailContract(html, project){
            var request = [html, project];
            $http.post('/send-contract', request).then(function(res){
              $rootScope.$broadcast("document:sent");
              $location.path('/projects/' + project._id + '/documents');
            });
          }

          function emailEstimate(html, project){
            var request = [html, project];
            $http.post('/send-estimate', request).then(function(res){
              $rootScope.$broadcast("document:sent");
              $location.path('/projects/' + project._id + '/documents');
            });
          }

          function sendInvoiceReminder(project, idx){
            console.log('service trying to send invoice reminder');
            var request = [project, idx];
            var reminder = {
              dateSent : Date.now(),
              number: project.invoices[idx].reminders.length + 1
            }
            project.invoices[idx].reminders.push(reminder);
            editProject(project);
            $http.post('/send-invoice-reminder', request).then(function(res){
              $location.path('/projects/' + project._id + '/documents');
            });
          };

          function sendReminder(project, type){
            var request = [project, type];
            if(type === 'contract'){
              var reminder = {
                dateSent: Date.now(),
                number: project.contract.reminders.length + 1
              }
              project.contract.reminders.push(reminder);
              editProject(project);
              $http.post('/send-contract-reminder', request).then(function(res){
                $location.path('/projects/' + project._id + '/documents');
              });
            }
            else if(type === 'estimate'){
              var reminder = {
                dateSent: Date.now(),
                number: project.estimate.reminders.length + 1
              };
              project.estimate.reminders.push(reminder);
              editProject(project);
              $http.post('/send-estimate-reminder', request).then(function(res){
                $location.path('/projects/' + project._id + '/documents');
              });
            }
          }

      }]);
})();
