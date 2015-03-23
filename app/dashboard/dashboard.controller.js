angular.module('dashboard')
  .controller('DashboardController', function(DashboardService, ProjectService, Account, $scope, $location, $auth){
    var dashCtrl = this;
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
    console.log($scope.user);

    dashCtrl.updateStats();

    ProjectService.getProjects().success(function(projects){
      dashCtrl.projects = _.where(projects, {'userId':$scope.user._id});
      console.log(dashCtrl.projects);
    });

    dashCtrl.updateStats = function(){
      DashboardService.updateStats();
    }
});
