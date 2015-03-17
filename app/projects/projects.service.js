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
            sendReminder : sendReminder
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
            console.log('editing project');
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

          function emailContract(html, project){
            var request = [html, project];
            project.contractSent = true;
            // project.contract.contractSent = true;
            // project.contract.sendDate = Date.now();
            editProject(project);
            $http.post('/generate-email', request).then(function(res){
              $rootScope.$broadcast("document:sent");
              $location.path('/projects/' + project._id + '/documents');
            });
          }

          function sendReminder(project, type){
            var request = [project, type];
            if(type === 'contract'){
              editProject(project);
              $http.post('/send-contract-reminder', request).then(function(res){
                $rootScope.$boradcast("reminder:sent");
                $location.path('/projects/' + project._id + '/documents');
              });
            };
            if(type ==='estimate'){
              editProject(project);
              $http.post('/send-estimate-reminder', request).then(function(res){
                $rootScope.$boradcast("reminder:sent");
                $location.path('/projects/' + project._id + '/documents');
              });
            };
          }

      }]);
})();
