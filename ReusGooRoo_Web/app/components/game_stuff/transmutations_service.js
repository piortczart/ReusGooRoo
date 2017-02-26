angular.module('myApp').factory('TransmutationsService', function () {

    function fill_transmutations(natural_source, transmutations, all_sources, active_aspects) {
        // We are iterating the transmutations of current natural source.
        natural_source.result.Transmutations.forEach(function (transmutation_description) {
            // Find the natural source which is the result of this transmutation.
            var transmutation = all_sources.find(function (a_source) {
                // Find the transmutation natural source.
                if (a_source.Name == transmutation_description.Target) {
                    return true;
                }
            });
            if (transmutation === undefined) {
                throw "A transmutation target not found in the list of natural sources: " + transmutation_description.Target;
            }

            // Make sure the transmutation natural source has the level our base natural source is at.
            // For example check if the base natural source is level 1 and the transmutation target only has levels 2 and 3
            // in which case the transmutation is not possible.
            var valid_target_level = transmutation.Levels.find(function (level) {
                return level.Level == natural_source.level;
            })
            if (valid_target_level === undefined) {
                // The target transmutation does not have our level (probably only has higher levels)
                return;
            }

            // Make sure we have the correct aspect for this transmutation (and the level is high enough).
            var a_valid_aspect = active_aspects.find(function (active_aspect_with_level) {
                // Active aspect level == 0 means it's not really active :)
                return active_aspect_with_level.level > 0 &&
                    active_aspect_with_level.aspect.name == transmutation_description.Aspect.Name &&
                    // It is possible to produce one level higher aspect than we have, just need luck/fertility.
                    active_aspect_with_level.level + 1 >= transmutation_description.Aspect.Level;
            });
            if (a_valid_aspect === undefined) {
                // We do not have a valid aspect to perform this transmutation.
                return;
            }

            var result = {
                level: natural_source.level,
                result: transmutation,
                paths: [natural_source.result.Name]
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
                existsing.paths.push(natural_source.result.Name)
            }
        })
    }

    return {
        fill_transmutations: fill_transmutations
    };
});