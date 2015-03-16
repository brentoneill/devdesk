app.directive('docugen', function () {
    return {
      restrict: 'E',
      transclude: false,
      templateUrl: 'projects/views/docs/contract.html',
      link: function(scope, element) {
         console.log(element);
    }
  }
});
