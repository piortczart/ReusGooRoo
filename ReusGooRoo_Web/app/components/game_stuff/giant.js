angular.module('myApp').factory('Giant', function (ValueMapper, GiantSlot, GiantAbilityWithLevel, GiantAspectWithLevel) {
    function Giant() {
        this.slots = [new GiantSlot(), new GiantSlot(), new GiantSlot(), new GiantSlot()];
    };

    Giant.fromJson = function (jsonObject) {
        return ValueMapper(new Giant(), jsonObject);
    }

    // Checks if the giant has the proper ambassadors for the selected ability ambassador combination.
    function has_proper_ambassadors(requirements, slots) {
        // Example requirements: "fsaa" - forest, swamp, any, any; "da" - desert, any
        var required_array = requirements.split('');

        if (required_array.length == 0) {
            return true;
        }

        // First letters of the ambassadors this giant has.
        // The last ambassadors we analyze should be 'a' (any) but since we analyze from the end,
        // we have to reverse the order here.
        var ambassadors = slots.filter(function (slot) {
            return slot.ambassador !== undefined && slot.ambassador !== null;
        }).map(function (slot_with_ambassador) {
            return slot_with_ambassador.ambassador.biome[0];
        }).reverse();

        // We don't even have enough ambassadors.
        if (ambassadors.length < required_array.length) {
            return false;
        }

        var has_all = true;
        for (var j = 0; j < required_array.length; j++) {
            var required_ambassador = required_array[j];
            var was_spliced = false;
            for (var i = ambassadors.length - 1; i >= 0; i--) {
                if (ambassadors[i] == required_ambassador || required_ambassador == 'a') {
                    ambassadors.splice(i, 1);
                    was_spliced = true;
                    break;
                }
            }
            if (!was_spliced) {
                has_all = false;
                break;
            }
        }

        return has_all;
    }

    // Abilities with their levels should be returned here.
    // All abilities are available with no ambassadors.
    // The ambassador combinations for each level are in the json. (ability.requires_ambassadors[])
    Giant.prototype.get_active_abilities = function () {
        var result = [];
        var slots = this.slots;

        this.abilities.forEach(function (ability) {
            var level = 0;
            for (var i = 0; i < ability.requires_ambassadors.length; i++) {
                var has_proper = has_proper_ambassadors(ability.requires_ambassadors[i], slots);
                if (has_proper) {
                    level = i + 1;
                } else {
                    break;
                }
            }
            result.push(new GiantAbilityWithLevel(ability, level))
        });

        return result;
    }

    Giant.prototype.get_active_aspects = function () {
        var result = [];
        var slots = this.slots;

        this.aspects.forEach(function (aspect) {
            var level = 0;
            for (var i = 0; i < aspect.requires_ambassadors.length; i++) {
                var has_proper = has_proper_ambassadors(aspect.requires_ambassadors[i], slots);
                if (has_proper) {
                    level = i + 1;
                } else {
                    break;
                }
            }
            result.push(new GiantAspectWithLevel(aspect, level))
        });

        return result;
    }

    // Return the constructor.
    // So in fact what is then injected into different services is a constructor function.
    return Giant;
});