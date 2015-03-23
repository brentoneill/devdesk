
var app = angular.module('devdesk', [
    'ngMessages',
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ui.router',
    'mgcrea.ngStrap',
    'ui.bootstrap',
    'auth',
    'profile',
    'clients',
    'projects',
    'devcal',
    'timer',
    'dashboard',
    'chart.js'
    //'posts'
    ])
  .config(function($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'home/views/home.html',
        controller: 'NavbarController as navCtrl'
      })
      .when('/developer-map', {
        templateUrl: 'home/views/devmap.html',
      })
      .when('/developer-list', {
        templateUrl: 'home/views/devlisting.html',
      })
      .when('/not-found', {
        templateUrl: 'home/views/not-found.html',
      })
      .otherwise({
        redirectTo: '/not-found'
      })
    })
    .constant('_', _);


    // In app.js or main.js or whatever:
    // var myApp = angular.module('askchisne', ['ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui.bootstrap.tpls']);

    // This filter makes the assumption that the input will be in decimal form (i.e. 17% is 0.17).
    app.filter('percentage', ['$filter', function ($filter) {
      return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
      };
    }]);

    app.directive('formatPhone', [
      function() {
          return {
              require: 'ngModel',
              restrict: 'A',
              link: function(scope, elem, attrs, ctrl, ngModel) {
                  elem.add(phonenumber).on('keyup', function() {
                     var origVal = elem.val().replace(/[^\w\s]/gi, '');
                     if(origVal.length === 10) {
                       var str = origVal.replace(/(.{3})/g,"$1-");
                       var phone = str.slice(0, -2) + str.slice(-1);
                       jQuery("#phonenumber").val(phone);
                     }

                  });
              }
          };
      }
    ]);

    app.filter('tel', function () {
        return function (tel) {
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country == 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    });
