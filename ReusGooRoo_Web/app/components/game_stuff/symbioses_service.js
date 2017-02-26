angular.module('myApp').factory('SymbiosesService', function () {

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

    function get_source_level_range(source_level) {
        var result = 0;
        var range = source_level.Yields.filter(function (y) {
            return y.Name == "range";
        })[0];
        return range === undefined ? result : range.Amount;
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
            var symbioses_if_next_to = symbioses.filter(function (symbiosis) {
                return symbiosis.Type == "ifNextTo"
            });
            symbioses_if_next_to.forEach(function (symbiosis) {
                // Check if the symbiosis is active (if we have the proper source next to this one).
                var is_active = next_to_it.some(function (other_source) {
                    var other_source = other_source.result;
                    return symbiosis_has_in_other_source(symbiosis, other_source);
                })
                if (is_active){
                    // Apply the symbiosis.
                    improve_source_at_index(range, item_index, symbioses_benefits, extra_benefits, symbiosis.Benefits);
                }
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

    return {
        calculate_symbiosis: calculate_symbiosis
    };
});