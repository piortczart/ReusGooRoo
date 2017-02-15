var Biomes = (function () {
    function Biomes(biomesArray) {
        this._all = biomesArray;
    };

    // Filtering function.
    function hasGiant(biome) {
        return biome.hasGiant;
    }

    // Filtering function.
    function hasAmbassador(biome) {
        return biome.hasAmbassador;
    }

    Biomes.prototype.withGiants = function () {
        return this._all.filter(hasGiant);
    };

    Biomes.prototype.withAmbassadors = function () {
        return this._all.filter(hasAmbassador);
    };

    return Biomes;
})();

angular.module('myApp').value('ValueMapper', function (target, source) {
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            target[prop] = source[prop];
        }
    }
    return target;
});

angular.module('myApp').factory('Giant', function (ValueMapper, GiantSlot) {
    function Giant() {
        this.slots = [new GiantSlot(), new GiantSlot(), new GiantSlot(), new GiantSlot()];
    };

    Giant.fromJson = function (jsonObject) {
        return ValueMapper(new Giant(), jsonObject);
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

angular.module('myApp').factory('GameObjectsService', function ($http, Giant, Ambassador, Resource) {
    return {
        get: function (file_name, mapper) {
            return $http
                .get('game_data/' + file_name + '.json')
                .then(function (jsonFile) {
                    var jsonArray = jsonFile.data;
                    return jsonArray.map(mapper);
                });
        },

        getGiants: function () {
            return this.get('giants', Giant.fromJson);
        },

        getAmbassadors: function () {
            return this.get('ambassadors', Ambassador.fromJson);
        },

        getResources: function () {
            return this.get('resources', Resource.fromJson);
        }
    };
});

