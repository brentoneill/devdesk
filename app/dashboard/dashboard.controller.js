angular.module('dashboard')
  .controller('DashboardController', function(DashboardService, ProjectService, Account, $location, $auth, $scope){
    var dashCtrl = this;

    $scope.user = $.parseJSON(localStorage.getItem('user'));

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];


    dashCtrl.buildDoughnutChart = function(projects){
      dashCtrl.doughnutStats = [0, 0, 0, 0];
      dashCtrl.doughnutLabels = ['Estimated', 'Completed', 'Invoiced', 'Paid'];

      _.each(projects, function(project, idx, arr){
        _.each(project.deliverables, function(item, idx, arr){ //d is a single deliverable
          if( item.paid === 'yes'){
            dashCtrl.doughnutStats[3] += +item.realCost;
          }
          else {
            if( item.invoiced === 'yes' ){
              dashCtrl.doughnutStats[2] += +item.realCost;
            }
            else {
              if( item.complete === 'yes' ){
                dashCtrl.doughnutStats[1] += +item.realCost;
              }
              else {
                if (item.inEstimate === 'yes' ){
                  dashCtrl.doughnutStats[0] += +item.cost;
                }
              }
            }
          }
        });
      });
    }

    dashCtrl.buildVelocityChart = function(projects){
      dashCtrl.velocityLabels = [];
      dashCtrl.velocityStats = [ [], [] ];
      dashCtrl.velocitySum = 0;
      _.each(projects, function(project, index, array){
        dashCtrl.velocityLabels.push(project.name.substring(0,13)+'...');
        dashCtrl.velocityStats[0].push((project.velocityAvg*100).toFixed(0));
        dashCtrl.velocitySum += +((project.velocityAvg*100).toFixed(0))
      });
      dashCtrl.velocityAvg = dashCtrl.velocitySum/(projects.length);
      _.each(projects, function(project,index,array){
        dashCtrl.velocityStats[1].push(dashCtrl.velocityAvg);
      });
      dashCtrl.velocitySeries = ['Project', 'Average'];
    }

    dashCtrl.calcAtAGlance = function(projects){
      dashCtrl.totalContracts = 0;
      dashCtrl.totalEstimates = 0;
      dashCtrl.totalInvoices = 0;
      dashCtrl.delivsInProgress = 0;
      dashCtrl.numOverBudget = 0;
      dashCtrl.contractsAccepted = 0;
      dashCtrl.estimatesAccepted = 0;
      dashCtrl.invoicesPaid = 0;
      _.each(projects, function(project, idx, arr){
        if(project.contractSent){
          dashCtrl.totalContracts++;
        }
        if(project.estimateSent){
          dashCtrl.totalEstimates++;
        }
        if(project.estCostTotal < project.realCostTotal){
          dashCtrl.numOverBudget++;
        }
        if(project.estimateAccepted){
          dashCtrl.estimatesAccepted++;
        }
        if(project.contractAccepted){
          dashCtrl.contractsAccepted++;
        }
        dashCtrl.totalInvoices += project.invoices.length;
        _.each(project.deliverables, function(deliv,idx,arr){
          if(deliv.complete === 'no'){
            dashCtrl.delivsInProgress++;
          }
        });

        _.each(project.invoices, function(inv, idx, arr){
          if(inv.paid === 'yes') {
            dashCtrl.invoicesPaid++;
          }
        });

      });
    };

    dashCtrl.buildGlanceChart = function(projects){
      dashCtrl.glanceLabels = [];
      dashCtrl.glanceData   = [ [], [] ];
      dashCtrl.glanceSeries = ['Active', 'Complete'];
      for( var i = 0; i < 7; i++){
        dashCtrl.glanceLabels[i] = Date.now();
      }
    };

    ProjectService.getProjects().success(function(projects){
      dashCtrl.projects = _.where(projects, {'userId':$scope.user._id});
      dashCtrl.buildDoughnutChart(dashCtrl.projects);
      dashCtrl.buildVelocityChart(dashCtrl.projects);
      dashCtrl.calcAtAGlance(dashCtrl.projects);
      dashCtrl.buildGlanceChart(dashCtrl.projects);
    });

    dashCtrl.updateStats = function(){
      DashboardService.updateStats();
    }

    dashCtrl.updateStats();
});
