angular.module('dashboard')
  .controller('DashboardController', function(DashboardService, ProjectService, Account, $location, $auth, $scope){
    var dashCtrl = this;

    moment.locale('en-US');

    $scope.getProfile = function() {
      Account.getProfile()
        .success(function(data) {
          $scope.user = data;
          localStorage.setItem('user', JSON.stringify(data));
          $scope.user = $.parseJSON(localStorage.getItem('user'));

          ProjectService.getProjects().success(function(projects){
            dashCtrl.projects = _.where(projects, {'userId':$scope.user._id});
            dashCtrl.buildDoughnutChart(dashCtrl.projects);
            dashCtrl.buildVelocityChart(dashCtrl.projects);
            dashCtrl.calcAtAGlance(dashCtrl.projects);
            dashCtrl.buildGlanceChart(dashCtrl.projects);
          });

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

    dashCtrl.buildDoughnutChart = function(projects){
      dashCtrl.doughnutStats = [0, 0, 0, 0];
      dashCtrl.doughnutLabels = ['Estimated', 'Completed', 'Invoiced', 'Paid'];
      dashCtrl.totalDelivDollars = 0;
      dashCtrl.totalDelivsPaid = 0;

      _.each(projects, function(project, idx, arr){
        _.each(project.deliverables, function(item, idx, arr){ //d is a single deliverable
          if( item.paid === 'yes'){
            dashCtrl.doughnutStats[3] += +item.realCost;
            dashCtrl.totalDelivsPaid += +item.realCost;
          }
          else {
            if( item.invoiced === 'yes' ){
              dashCtrl.doughnutStats[2] += +item.realCost;
              dashCtrl.totalDelivDollars += +item.realCost;
            }
            else {
              if( item.complete === 'yes' ){
                dashCtrl.doughnutStats[1] += +item.realCost;
                dashCtrl.totalDelivDollars += +item.realCost;
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
      dashCtrl.weekData   = [ 0, 0, 0, 0 ];
      dashCtrl.monthData   = [ 0, 0, 0, 0 ];
      dashCtrl.glanceLabels = ['Estimated', 'Complete', 'Invoiced', 'Paid'];

      var todayM = moment().add('1', 'days');
      var weekAgoM = moment().subtract('7', 'days');
      var weekAgo = weekAgoM.format('YYYY-MM-DD');
      var today = todayM.format('YYYY-MM-DD');

      _.each(dashCtrl.projects, function(project, index, array){
        _.each(project.deliverables, function(deliv, index, array){
          if(deliv.completeDate) {
            var dayComplete = moment(deliv.completeDate);
            if(dayComplete.isBetween(weekAgo, today)){
              dashCtrl.weekData[1]++;
            }
            if(dayComplete.isBetween('2015-02-25', '2015-03-25')){
              dashCtrl.monthData[1]++;
            }
          }
          if(deliv.invoicedDate){
            var dayInvoiced = moment(deliv.invoicedDate);
            if(dayInvoiced.isBetween(weekAgo, today)){
              dashCtrl.weekData[2]++;
            }
            if(dayInvoiced.isBetween('2015-02-25', '2015-03-25')){
              dashCtrl.monthData[2]++;
            }
          }
          if(deliv.paidDate){
            var dayPaid = moment(deliv.paidDate);
            if(dayPaid.isBetween(weekAgo, today)){
              dashCtrl.weekData[3]++;
            }
            if(dayPaid.isBetween('2015-02-25', '2015-03-25')){
              dashCtrl.monthData[3]++;
            }
          }
          if(deliv.estimateDate){
            var dayEstimated = moment(deliv.estimateDate);
            if(dayEstimated.isBetween(weekAgo, today)){
              dashCtrl.weekData[0]++;
            }
            if(dayEstimated.isBetween('2015-02-25', '2015-03-25')){
              dashCtrl.monthData[0]++;
            }
          }
        });
      });
    };

    dashCtrl.updateStats = function(){
      DashboardService.updateStats();
    }

    dashCtrl.updateStats();
});
