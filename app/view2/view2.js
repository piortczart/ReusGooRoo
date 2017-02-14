'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', function($scope, $http, gameServiceFactory) {
    // Giants
    //this.giants = gameServiceFactory.all_giants;
    // Ambassadors
    this.ambassadors = gameServiceFactory.all_ambassadors;
    // Resources
    this.resources = gameServiceFactory.all_resources;

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

    $http
        .get('game_data/giants.json')
        .then(function(jsonFile) {
            // Prepare a list of biomes (as objects)
            var itemsArr = [];
            for (var index = 0; index < jsonFile.data.length; ++index) {
                // Deserialize json entry into an object.
                var item = new Giant(jsonFile.data[index]);
                itemsArr.push(item);
            }
            x.giants = itemsArr;

            console.log('', x.giants[0].biome)
        });

    $scope.lotSize = 3;

    $scope.update = function(){
      this.slot.ambassador = this.slotModel;
      console.log(gameServiceFactory.all_giants[0]);
    };

    $scope.updateLotSize = function(){
        console.log(this.lotSize);
        if (this.lotSize > 10){
            this.lotSize = 10;
        }
        if (this.lotSize < 1){
            this.lotSize = 1;
        }
    };

    $scope.calculateStuff = function() {
        $scope.calculationResult = 10;
    };
});
//
// {
// |
// |{{NaturalSource
// |bodystyle      = float:none;
// |name           = Blueberry
//     |image          = [[File:BLUE BERRY.png]]
// |level          = 1
//     |aspects        = 1
//     |food           = 5
//     |natura         = 1
//     |symbiosis1     = ''Grove'': {{Food|+10}} if next to an [[Apple Tree]], [[Dandelion]] or [[Strawberry]].
//     |transmutation1 = [[Strawberry]]
//     |transmutation2 = [[Apple Tree]]
// }}
// |{{NaturalSource
// |bodystyle      = float:none;
// |name           = Great Blueberry
//     |image          = [[File:BLUE BERRY SMALL.png]]
// |level          = 2
//     |aspects        = 2
//     |food           = 10
//     |natura         = 1
//     |symbiosis1     = ''Grove'': {{Food|+20}} if next to an [[Apple Tree]], [[Dandelion]] or [[Strawberry]].
//     |transmutation1 = [[Strawberry|Great Strawberry]]
//     |transmutation2 = [[Apple Tree|Great Apple Tree]]
// }}
// |{{NaturalSource
// |bodystyle      = float:none;
// |name           = Superior Blueberry
//     |image          = [[File:BLUE BERRY MEDIUM.png]]
// |level          = 3
//     |aspects        = 3
//     |food           = 20
//     |natura         = 2
//     |symbiosis1     = ''Grove'': {{Food|+40}} if next to an [[Apple Tree]], [[Dandelion]] or [[Strawberry]].
//     |transmutation1 = [[Strawberry|Superior Strawberry]]
//     |transmutation2 = [[Apple Tree|Superior Apple Tree]]
// }}
// |}

