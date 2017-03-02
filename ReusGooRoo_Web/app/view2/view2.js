'use strict';

Array.prototype.selectMany = function (fn) {
    return this.map(fn).reduce(function (x, y) {
        return x.concat(y);
    }, []);
};

angular.module('myApp').factory('PersistenceService', function ($cookies) {

    function update_slots(giants) {
        var giants_ambassadors = giants.map(function (giant) {
            return giant.slots.map(function (slot) {
                var ambassador = slot.ambassador;
                return ambassador === undefined ? undefined : ambassador.biome;
            })
        })

        $cookies.putObject('giants_ambassadors', giants_ambassadors);
    }

    return {
        store_slots: update_slots
    };
});

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', function ($scope, $http, GameObjectsService,
                                       PersistenceService, TileBenefits,
                                       NaturalSource, SymbiosesService, TransmutationsService,
                                       CombinationsService) {
        GameObjectsService.getGiants().then(function (giants) {
            $scope.giants = giants;
            update_active_abilities_and_aspects();
        });

        GameObjectsService.getAmbassadors().then(function (ambassadors) {
            $scope.ambassadors = ambassadors;
        });

        GameObjectsService.getResources().then(function (resources) {
            $scope.resources = resources;
        });

        GameObjectsService.getBiomes().then(function (resources) {
            $scope.biomes = resources;

            $scope.selected_biomes = $scope.biomes.map(function (biome) {
                return {name: biome.name, selected: true}
            })
        });

        $scope.selected_families = ["Minerals", "Animals", "Plants"].map(function (family) {
            return {name: family, selected: true}
        })

        GameObjectsService.getNaturalSources().then(function (sources) {
            $scope.sources = sources;
        });

        $scope.active_abilities_and_aspects = [];

        $scope.lotSize = 2;

        $scope.possible_natural_sources = {};

        function update_active_abilities_and_aspects() {
            $scope.active_abilities_and_aspects = $scope.giants.map(function (giant) {
                return {
                    giant_name: giant.name,
                    abilities: giant.get_active_abilities(),
                    aspects: giant.get_active_aspects()
                };
            })
        }

        $scope.update = function () {
            // "this" in this context is the angular's "ChildScope"
            // we have a "slot" here (connected to a giant) and a "slotModel" which is the thing bound to the combo box
            this.slot.ambassador = this.slotModel;

            update_active_abilities_and_aspects();

            PersistenceService.store_slots($scope.giants);

            recalculate_basic_stats();
        };

        $scope.updateLotSize = function () {
            if (this.lotSize > 10) {
                this.lotSize = 10;
            }
            if (this.lotSize < 1) {
                this.lotSize = 1;
            }
        };

        // Returns list of object containing natural sources and levels which can be created by giants with current abilities.
        function get_starting_sources() {
            // $scope.active_abilities has an array objects with: "giant_name" and "abilities" (list of GiantAbilityWithLevel)
            // Create a list of GiantAbilityWithLevel objects
            var abilities_with_levels = $scope.active_abilities_and_aspects.selectMany(function (active_ability_aspect) {
                return active_ability_aspect.abilities;
            });

            // Create a list of natural sources (and their levels) we can produce using active abilities.
            var result = [];
            abilities_with_levels.forEach(function (ability_with_level) {
                ability_with_level.ability.valid_biomes.forEach(function (biome_and_source) {
                    var source = NaturalSource.get_by_name(biome_and_source.produces, $scope.sources);
                    result.push({
                        level: ability_with_level.level,
                        result: source,
                        ability: ability_with_level.ability,
                        biome: biome_and_source.name
                    })
                })
            });

            return result;
        }

        function biome_filter(source) {
            var is_biome_valid = false;
            for (var i = 0; i < $scope.selected_biomes.length; i++) {
                var valid_biome = $scope.selected_biomes[i];
                if (!valid_biome.selected) {
                    continue;
                }

                if (source.result.Biomes.some(function (source_biome) {
                        return source_biome.toUpperCase() == valid_biome.name.toUpperCase();
                    })) {
                    is_biome_valid = true;
                }
                if (is_biome_valid) {
                    break;
                }
            }

            if (!is_biome_valid) {
                return false;
            }

            var is_family_valid = false;
            for (var i = 0; i < $scope.selected_families.length; i++) {
                var valid_family = $scope.selected_families[i];
                if (!valid_family.selected) {
                    continue;
                }
                if (valid_family.name.toUpperCase() == source.result.Family.toUpperCase()) {
                    is_family_valid = true;
                }
            }

            if (!is_family_valid) {
                return false;
            }

            return true;
        }

        $scope.iterations_needed = "?";

        function recalculate_basic_stats() {
            var starting_sources = get_starting_sources().filter(biome_filter);

            // Calculate all possible transmutations.
            var transmutations = [];
            var active_aspects = $scope.active_abilities_and_aspects.selectMany(function (aaa) {
                return aaa.aspects;
            });
            starting_sources.forEach(function (starting_source) {
                if (starting_source.result.Name == "Chicken")
                    TransmutationsService.fill_transmutations(starting_source, transmutations, $scope.sources, active_aspects);
            })
            transmutations = transmutations.filter(biome_filter);

            var all_available_sources = starting_sources.concat(transmutations)

            all_available_sources = all_available_sources.sort(function (a, b) {
                return a.result.Name.localeCompare(b.result.Name);
            })

            $scope.possible_natural_sources = {
                total_count: all_available_sources.length,
                base_count: starting_sources.length,
                transmutations_count: transmutations.length,
                actual_sources: all_available_sources
            };

            $scope.iterations_needed = Math.pow(all_available_sources.length, $scope.lotSize);

            return all_available_sources;
        }

        $scope.all_results = [];
        $scope.best_results = [];

        $scope.calculateStuff = function () {
            var all_available_sources = recalculate_basic_stats();

            var magic = [];

            var best_food = [];
            var best_wealth = [];
            var best_tech = [];
            var all = [];

            var combinations = CombinationsService.get_combinations(all_available_sources, $scope.lotSize);


            combinations.forEach(function (sources) {

                // if (sources[0].result.Name != "Strawberry" ||
                //     sources[1].result.Name != "Blueberry" ||
                //     sources[2].result.Name != "Strawberry"){
                //     return;
                // }

                var symbioses_benefits = [];
                // Any leftover benefits like benefits outside of the given range.
                var extra_benefits = new TileBenefits($scope.resources);
                // Fill the benefits with empty resources.
                for (var i = 0; i < sources.length; i++) {
                    symbioses_benefits[i] = new TileBenefits($scope.resources);
                }
                // symbioses_benefits should get filled.
                for (var i = 0; i < sources.length; i++) {
                    SymbiosesService.calculate_symbiosis(sources, i, symbioses_benefits, extra_benefits);
                }

                var all_benefits = new TileBenefits($scope.resources);
                all_benefits.add_benefits(extra_benefits.benefits);
                symbioses_benefits.forEach(function (symbiosis_benefit) {
                    all_benefits.add_benefits(symbiosis_benefit.benefits);
                })

                all.push({
                    s: sources.map(function (s) {
                        return s.result.Name;
                    }),
                    b: all_benefits
                })
            })

            var best_items_count = 10;

            var source_types = ["food", "technology", "wealth", "natura"];
            source_types.forEach(function (source_type) {
                var local_best = all.sort(function (a, b) {
                    return b.b.get_benefit(source_type).Amount - a.b.get_benefit(source_type).Amount;
                })
                for (var i = 0; i < best_items_count && i < local_best.length; i++) {
                    $scope.best_results.push(local_best[i]);
                }
            })
        };
    });

