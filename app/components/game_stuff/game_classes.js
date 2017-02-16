angular.module('myApp').factory('Giant', function (ValueMapper, GiantSlot) {
    function Giant() {
        this.slots = [new GiantSlot(), new GiantSlot(), new GiantSlot(), new GiantSlot()];
    };

    Giant.fromJson = function (jsonObject) {
        return ValueMapper(new Giant(), jsonObject);
    }

    function has_ambassador(first_letter) {
        if (first_letter == 'a')
            return true;
        for (var i = 0; i < 4; i++) {
            if (this.slots[i].ambassador[i] == first_letter)
                return true;
        }
        return false;
    }

    Giant.prototype.get_active_abilities = function() {
        return this.abilities.filter(function (ability) {
            return ability.requires_ambassadors[0] == ""
                || ability.requires_ambassadors[0].split('')
        });
    }

    // Return the constructor.
    // So in fact what is then injected into different services is a constructor function.
    return Giant;
});

angular.module('myApp').factory('GiantSlot', function () {
    function GiantSlot() {
    };
    return GiantSlot;
});

angular.module('myApp').factory('Ambassador', function (ValueMapper) {
    function Ambassador() {
    }

    Ambassador.fromJson = function (jsonObject) {
        return ValueMapper(new Ambassador(), jsonObject);
    }

    // Return the constructor.
    return Ambassador;
});

angular.module('myApp').factory('Resource', function (ValueMapper) {
    function Resource() {
    }

    Resource.fromJson = function (jsonObject) {
        return ValueMapper(new Resource(), jsonObject);
    }

    return Resource;
});

angular.module('myApp').factory('Biome', function (ValueMapper) {
    function Biome() {
    }

    Biome.fromJson = function (jsonObject) {
        return ValueMapper(new Biome(), jsonObject);
    }

    // Return the constructor.
    return Biome;
});