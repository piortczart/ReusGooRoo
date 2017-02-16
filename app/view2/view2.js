'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', function ($scope, $http, GameObjectsService) {
        GameObjectsService.getGiants().then(function (giants) {
            $scope.giants = giants;
        });

        GameObjectsService.getAmbassadors().then(function (ambassadors) {
            $scope.ambassadors = ambassadors;
        });

        GameObjectsService.getResources().then(function (resources) {
            $scope.resources = resources;
        });

        GameObjectsService.getBiomes().then(function (resources) {
            $scope.biomes = resources;
        });

        $scope.lotSize = 3;

        $scope.update = function () {
            this.slot.ambassador = this.slotModel;
        };

        $scope.updateLotSize = function () {
            console.log(this.lotSize);
            if (this.lotSize > 10) {
                this.lotSize = 10;
            }
            if (this.lotSize < 1) {
                this.lotSize = 1;
            }
        };

        function is_biome_valid_for_ability(ability, biome_name) {
            for (var i = 0; i < ability.valid_biomes.length; i++) {
                var suspected_biome = ability.valid_biomes[i];
                if (suspected_biome == "all" || suspected_biome == biome_name) {
                    return true;
                }
            }
            return false;
        }

        function get_ability_on_biome_product(ability, biome_name) {
            return ability.name + " on " + biome_name;
        }

        $scope.calculateStuff = function () {
            $scope.calculationResult = 10;

            // Prepare a list of all abilities giants currently have.
            var abilities = [];
            $scope.giants.forEach(function (item) {
                abilities = abilities.concat(item.get_active_abilities());
            });

            var abilities_biomes = [];
            abilities.forEach(function (ability) {
                $scope.biomes.forEach(function (biome) {
                    if (is_biome_valid_for_ability(ability, biome.name)) {
                        abilities_biomes.push({"ability": ability, "biome": biome})
                    }
                });
            });

            var magic = [];
            abilities_biomes.forEach(function (item1) {
                abilities_biomes.forEach(function (item2) {
                    abilities_biomes.forEach(function (item3) {
                        magic.push([
                            get_ability_on_biome_product(item1.ability, item1.biome.name),
                            get_ability_on_biome_product(item2.ability, item2.biome.name),
                            get_ability_on_biome_product(item3.ability, item3.biome.name)])
                    })
                })
            });

            console.log('', magic);
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

