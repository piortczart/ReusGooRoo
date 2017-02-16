angular.module('myApp').value('ValueMapper', function (target, source) {
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            target[prop] = source[prop];
        }
    }
    return target;
});

angular.module('myApp').factory('GameObjectsService', function ($http, Giant, Ambassador, Resource, Biome) {
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
        },

        getBiomes: function () {
            return this.get('biomes', Biome.fromJson);
        }
    };
});

