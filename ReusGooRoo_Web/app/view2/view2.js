'use strict';

Array.prototype.selectMany = function (fn) {
    return this.map(fn).reduce(function (x, y) {
        return x.concat(y);
    }, []);
};

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', function ($scope, $http, GameObjectsService, TileBenefits, NaturalSource) {
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

        GameObjectsService.getNaturalSources().then(function (sources) {
            $scope.sources = sources;
        });

        $scope.active_abilities_and_aspects = [];

        $scope.lotSize = 3;

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
        };

        $scope.updateLotSize = function () {
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

        function get_source_level_range(source_level) {
            var result = 0;
            var range = source_level.Yields.filter(function (y) {
                return y.Name == "range";
            })[0];
            return range === undefined ? result : range.Amount;
        }

        function add_benefit_at_index(index, symbioses_benefits, yields, extra_benefits) {
            // Make sure we are within possible range.
            if (index >= 0 && index < symbioses_benefits.length) {
                symbioses_benefits[index].add_benefits(yields)
            } else {
                // We are outside of the range!
                // Add any stuff to the overflow.
                extra_benefits.add_benefits(yields);
            }
        }

        function improve_source_at_index(range, item_index, symbioses_benefits, extra_benefits, yields) {
            for (var i = 0; i <= range; i++) {
                if (i == 0) {
                    symbioses_benefits[item_index].add_benefits(yields);
                } else {
                    add_benefit_at_index(item_index + i, symbioses_benefits, yields, extra_benefits)
                    add_benefit_at_index(item_index - i, symbioses_benefits, yields, extra_benefits)
                }
            }
        }

        function symbiosis_has_in_other_source(symbiosis, other_source) {
            var has_direct_name = $.inArray(other_source.Name, symbiosis.OtherSource) != -1;
            var family_name = other_source.Family.slice(0, -1);
            var has_family_name = $.inArray(family_name, symbiosis.OtherSource) != -1;
            return has_family_name || has_direct_name;
        }

        // Calculate the symbiosis for the source with given index when there is the list of sources around.
        function calculate_symbiosis(sources, item_index, symbioses_benefits, extra_benefits) {
            var base = sources[item_index];

            var source_level = base.result.Levels[base.level - 1];
            var range = get_source_level_range(source_level);

            // At this benefits slot we first add the yields of the source at this spot.
            // We need to include (possibly) the range of this source.
            improve_source_at_index(range, item_index, symbioses_benefits, extra_benefits, source_level.Yields)

            // Now we calculate the symbioses.
            var symbioses = source_level.Symbioses;

            //
            // ifNextTo symbiosis
            //
            {
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
                var ifNextTos = symbioses.filter(function (symbiosis) {
                    return symbiosis.Type == "ifNextTo"
                });
                ifNextTos.forEach(function (symbiosis) {
                    next_to_it.forEach(function (other_source) {
                        var other_source = other_source.result;
                        if (symbiosis_has_in_other_source(symbiosis, other_source)) {
                            improve_source_at_index(range, item_index, symbioses_benefits, extra_benefits, symbiosis.Benefits);
                        }
                    })
                });
            }
            // ifWithinRange symbiosis
            {
                var ifWithinRanges = symbioses.filter(function (symbiosis) {
                    return symbiosis.Type == "ifSourceWithinRange"
                });
                ifWithinRanges.forEach(function (symbiosis) {
                    var is_active = false;

                    // This are the indexes within range.
                    var index_start = item_index - range;
                    if (index_start < 0) {
                        index_start = 0;
                    }
                    var index_end = item_index + range;
                    if (index_end >= sources.length) {
                        index_end = sources.length - 1;
                    }

                    // Check if the symbiosis is active.
                    for (var i = index_start; i <= index_end; i++) {
                        // Do not check myself.
                        if (i == item_index) {
                            continue;
                        }

                        symbiosis.OtherSource.forEach(function (otherSource) {
                            if (otherSource == sources[i].result.Name) {
                                is_active = true;
                            }
                        })
                        if (is_active) {
                            break;
                        }
                    }

                    // This symbiosis is active!
                    if (is_active) {
                        improve_source_at_index(range, item_index, symbioses_benefits, extra_benefits, symbiosis.Benefits);
                    }
                });
            }
        }

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

        function fill_transmutations(source, transmutations, all_sources, active_aspects) {
            source.result.Transmutations.forEach(function (transmutation_description) {

                var transmutation = all_sources.filter(function (a_source) {
                    // Find the transmutation natural source.
                    if (a_source.Name == transmutation_description.Target) {
                        // Make sure we have the right aspect.
                        var valid_aspect = active_aspects.filter(function (aspect_with_level) {
                            var s = a_source;
                            return aspect_with_level.aspect.name == transmutation_description.Aspect.Name &&
                                aspect_with_level.level <= transmutation_description.Aspect.Level;
                        })[0]

                        // Make sure we have level high enough for at least one transmutation.
                        var valid_level = a_source.Levels.filter(function (source_level) {
                            var level_to_check = source_level.Level;
                            return level_to_check <= source.level;
                        })[0];

                        return valid_aspect !== undefined && valid_level !== undefined;
                    }
                    return false;
                })[0];

                if (transmutation !== undefined) {
                    var result = {
                        level: source.level,
                        result: transmutation,
                        paths: [source.result.Name]
                    }

                    // Add this transmutation to the existing list.
                    // Make sure it's not there yet.
                    var existsing = transmutations.filter(function (t) {
                        return t.result.Name == transmutation.Name;
                    })[0];

                    if (typeof existsing === 'undefined') {
                        transmutations.push(result);
                        fill_transmutations(result, transmutations, all_sources, active_aspects);
                    } else {
                        existsing.paths.push(source.result.Name)
                    }
                }
            })
        }

        function biome_filter(source) {
            for (var i = 0; i < $scope.selected_biomes.length; i++) {
                var valid_biome = $scope.selected_biomes[i];
                if (!valid_biome.selected) {
                    continue;
                }

                if (valid_biome.name.toUpperCase() == source.result.Biome.toUpperCase()) {
                    return true;
                }
            }
            return false;
        }

        $scope.best_sources_food = [];

        $scope.calculateStuff = function () {
            var starting_sources = get_starting_sources().filter(biome_filter);

            // starting_sources = starting_sources.filter(function (source) {
            //     return source.result.Name == "Marten";
            // })

            var magic = [];

            var best_food = [];
            var best_wealth = [];
            var best_tech = [];

            // Calculate all possible transmutations.
            var transmutations = [];
            var active_aspects = $scope.active_abilities_and_aspects.selectMany(function (aaa) {
                return aaa.aspects;
            });
            starting_sources.forEach(function (starting_source) {
                fill_transmutations(starting_source, transmutations, $scope.sources, active_aspects);
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

            var all = [];

            var count = 0;
            all_available_sources.forEach(function (source1) {
                all_available_sources.forEach(function (source2) {
                    var name1 = source1.result.Name;
                    var name2 = source2.result.Name;
                    //console.log(name1 + ", " + name2 + ", " + count++);

                    // if (name2 != "Blueberry") {
                    //     return;
                    // }

                    var sources = [source1, source2];
                    var symbioses_benefits = [];
                    // Any leftover benefits like benefits outside of the given range.
                    var extra_benefits = new TileBenefits($scope.resources);
                    // Fill the benefits with empty resources.
                    for (var i = 0; i < sources.length; i++) {
                        symbioses_benefits[i] = new TileBenefits($scope.resources);
                    }
                    // symbioses_benefits should get filled.
                    for (var i = 0; i < sources.length; i++) {
                        calculate_symbiosis(sources, i, symbioses_benefits, extra_benefits);
                    }

                    var all_benefits = new TileBenefits($scope.resources);
                    all_benefits.add_benefits(extra_benefits.benefits);
                    symbioses_benefits.forEach(function (symbiosis_benefit) {
                        all_benefits.add_benefits(symbiosis_benefit.benefits);
                    })


                    all.push({
                        s: [source1.result.Name, source2.result.Name],
                        b: all_benefits
                    })

                    // var current_wealth = all_benefits.get_benefit("wealth").Amount;
                    // var current_tech = all_benefits.get_benefit("technology").Amount;
                    // if (best_wealth === undefined || best_wealth.wealth < current_wealth) {
                    //     best_wealth = {
                    //         "wealth": current_wealth,
                    //         "s": [source1.result.Name, source2.result.Name],
                    //         "b": symbioses_benefits.map(function (sb) {
                    //             return JSON.stringify(sb.get_benefits(), null);
                    //         }),
                    //         "e": JSON.stringify(extra_benefits.get_benefits())
                    //     }
                    // }
                    // if (best_tech === undefined || best_tech.tech < current_tech) {
                    //     best_tech = {
                    //         "tech": current_tech,
                    //         "s": [source1.result.Name, source2.result.Name],
                    //         "b": symbioses_benefits.map(function (sb) {
                    //             return JSON.stringify(sb.get_benefits(), null);
                    //         }),
                    //         "e": JSON.stringify(extra_benefits.get_benefits())
                    //     }
                    // }
                })
            })

            var all_food = all.sort(function (a, b) {
                return b.b.get_benefit("food").Amount - a.b.get_benefit("food").Amount;
            })
            $scope.best_sources_food = [];
            for(var i=0; i<5 && i < all_food.length; i++){
                $scope.best_sources_food.push(all_food[i]);
            }

             console.log(JSON.stringify(all_food[0], null, "  "));
            // console.log(JSON.stringify(best_tech, null, "  "));
        };
    });

