(function(){
  "use strict";

  //Main app controller//
  angular.module('devdesk')
    .controller('TimerController', function($scope) {
            $scope.timerRunning = false;

            $scope.startTimer = function (){
                $scope.$broadcast('timer-start');
                $scope.timerRunning = true;
            };

            $scope.stopTimer = function (){
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            };

            $scope.$on('timer-stopped', function (event, data){
                console.log('Timer Stopped - data = ', data);
                var timeToAdd = data.minutes/60 + data.hours;
                console.log(timeToAdd);
                console.log($scope.delivBeingTracked);
            });
    })
})();
