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
            emailDocument: emailDocument
          }


          function getProjects(){
            return $http.get('api/collections/projects');
          }

          function getProject(projectId){
            return $http.get('api/collections/projects/' + projectId);
          }

          function createProject(newProject) {
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

          function emailDocument(html, project){
            var request = [html, project];
            $http.post('/generate-email', request).then(function(res){
              $rootScope.$broadcast("document:sent");
              $location.path('/projects/' + project._id + '/documents');
            });
          }

      }]);
})();
