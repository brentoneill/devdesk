angular.module('dashboard')
  .controller('DashboardController', function(DashService, ProjectService, ClientService, Account, $location, $scope, $auth){

    /**
     * Get user's profile information.
     */
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
      projCtrl.projects = _.where(projects, {'userId':$scope.user._id});
      console.log(projCtrl.projects);
    });
});
