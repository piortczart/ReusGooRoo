'use strict';

angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'datatables',
    'ngStorage',
    'ui.bootstrap',
    'myApp.view2',
    'myApp.version'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo: '/view2'});
}]);
