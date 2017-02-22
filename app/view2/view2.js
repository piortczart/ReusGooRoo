'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', function ($scope, $http, GameObjectsService, TileBenefits) {
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

        GameObjectsService.getNaturalSources().then(function (sources) {
            $scope.sources = sources;
        });


        $scope.lotSize = 3;

        $scope.update = function () {
            // "this" in this context is the angular's "ChildScope"
            // we have a "slot" here (connected to a giant) and a "slotModel" which is the thing bound to the combo box
            this.slot.ambassador = this.slotModel;

            console.log('', $scope.giants[0].get_active_abilities()[0].level);
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
                if (suspected_biome.name == "all" || suspected_biome.name == biome_name) {
                    return true;
                }
            }
            return false;
        }

        function get_ability_on_biome_product(ability, biome_name) {
            var result = ability.valid_biomes.filter(function (biome) {
                return biome.name == biome_name;
            })[0];
            if (result === undefined) {
                return ability.name + " on " + biome_name + "?";
            }
            return result.produces;
        }

        // Calculate the symbiosis for the source with given index when there is the list of sources around.
        function calculate_symbiosis(sources, item_index, symbioses_benefits) {
            var base = sources[item_index];

            // Calculate what's next to it.
            var next_to_it = [];
            if (item_index > 0) {
                // Add the previous one.
                next_to_it.push(sources[item_index - 1]);
            }
            if (item_index < sources.length - 1) {
                // Add the next one.
                next_to_it.push(sources[item_index + 1]);
            }

            // TEMP: We are only interested in level 1 sources
            var source_level = base.Levels.filter(function (l) {
                return l.Level == 1;
            })[0];
            if (source_level === undefined){
                return;
            }

            // Add the regular source yield
            if (symbioses_benefits[item_index] === undefined) {
                symbioses_benefits[item_index] = new TileBenefits($scope.resources);
            }
            symbioses_benefits[item_index].add_benefits(base.Levels[0].Yields);

            var symbioses = base.Levels[0].Symbioses;

            var nextTos = symbioses.filter(function (symbiosis) {
                return symbiosis.Type == "ifNextTo"
            });
            nextTos.forEach(function (symbiosis) {
                next_to_it.forEach(function (other_source) {
                    if ($.inArray(other_source.Name, symbiosis.OtherSource) != -1) {
                        symbioses_benefits[item_index].add_benefits(symbiosis.Benefits);
                    }
                })
            });

            //console.log("Sources: ", sources);
            //console.log("Benefits: ", symbioses_benefits);
        }

        $scope.calculateStuff = function () {
            var magic = [];

            var top_food = 0;
            var best;

            $scope.sources.slice(0, 50).forEach(function (source1) {
                $scope.sources.slice(0, 50).forEach(function (source2) {
                    var sources = [source1, source2];
                    var symbioses_benefits = [];
                    // symbioses_benefits should get filled.
                    for (var i = 0; i < sources.length; i++) {
                        calculate_symbiosis(sources, i, symbioses_benefits);
                    }
                    console.log("Sources: ", sources.map(function (source) {
                        return source.Name
                    }));


                    var total_food = 0;
                    symbioses_benefits.forEach(function (symbiosis_benefit) {
                        total_food += symbiosis_benefit.get_benefit("food").Amount;
                    })

                    if (total_food > top_food) {
                        top_food = total_food;
                        best = {
                            "s": [source1.Name, source2.Name],
                            "b": symbioses_benefits.map(function (sb) {
                                return JSON.stringify(sb.get_benefits(), null, "  ");
                            })
                        };
                    }
                })
            })

            console.log(JSON.stringify(best, null, "  "));
        };
    });

