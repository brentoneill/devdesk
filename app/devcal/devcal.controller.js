(function () {
    "use strict";

    angular
        .module('devcal')
        .controller('CalendarController', ['ProjectService', 'Account', '$location', '$routeParams', '$auth', '$scope',
        function(ProjectService, Account, $location, $routeParams, $auth, $scope, $http) {

          var calCtrl = this;

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
            calCtrl.projects = _.where(projects, {'userId':$scope.user._id})
            console.log(calCtrl.projects);
          });

          //Calendar Stuff
          $scope.uiConfig = {
            calendar:{
              height: 450,
              editable: true,
              header:{
                left: 'month basicWeek',
                center: 'title',
                right: 'today prev,next'
              },
              dayClick: $scope.alertEventOnClick,
              eventDrop: $scope.alertOnDrop,
              eventResize: $scope.alertOnResize
            }
          }

          var date = new Date();
          var d = date.getDate();
          var m = date.getMonth();
          var y = date.getFullYear();


          $scope.eventSources = [
            {title: 'All Day Event',start: new Date(y, m, 1)},
            {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
            {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
          ];
          console.log($scope.eventSources);

      }]);
})();
