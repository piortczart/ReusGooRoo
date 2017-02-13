'use strict';

(function (angular) {

    angular
        .module("myApp")
        .filter("format", function () {
            return function (input) {
                var args = arguments;
                return input.replace(/\{(\d+)\}/g, function (match, capture) {
                    return args[1*capture + 1];
                });
            };
        });

})(angular);

var app = angular.module('myApp.view1', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($http, $scope) {
    var x = this;
    $http
        .get('game_data/biomes.json')
        .then(function(jsonFile) {
            // Prepare a list of biomes (as objects)
            var biomesArr = [];
            for (var index = 0; index < jsonFile.data.length; ++index) {
                // Deserialize json entry into a Biome object.
                var biome = new Biome(jsonFile.data[index]);
                biomesArr.push(biome);
            }
            // Store the biome objects.
            x.biomes = new Biomes(biomesArr);
        });

    $scope.updateSelection = function() {
        var x = this;
    }
});

var Giant = (
    function(){
        function Giant(ambassadors) {
            this._ambassadors = ambassadors;
        };

        return Giant;
    })();

var Biomes = (
    function(){
        function Biomes(biomesArray) {
            this._all = biomesArray;
        };

        function hasGiant(biome){ return biome.hasGiant; }

        function hasAmbassador(biome){ return biome.hasAmbassador; }

        Biomes.prototype.withGiants = function() {
            return this._all.filter(hasGiant);
        };

        Biomes.prototype.withAmbassadors = function() {
            return this._all.filter(hasAmbassador);
        };

        return Biomes;
    })();

var Biome = (
    function(){
        var name;

        function Biome(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    this[prop] = obj[prop];
                }
            }
        };

        return Biome;
    })();