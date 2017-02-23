angular.module('myApp').factory('GiantAbility', function () {
    function GiantAbility(name, level) {
        this.name = name;
        this.level = level;
    };
    return GiantAbility;
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

angular.module('myApp').factory('NaturalSource', function (ValueMapper) {
    function NaturalSource() {
    }

    NaturalSource.fromJson = function (jsonData) {
        return ValueMapper(new NaturalSource(), jsonData);
    }

    // Return the constructor.
    return NaturalSource;
});

angular.module('myApp').factory('TileBenefits', function () {
    var benefits;

    function TileBenefits(resources) {
        benefits = resources;
        benefits.forEach(function (benefit) {
            benefit.Amount = 0;
        })
    }

    TileBenefits.prototype.get_benefits = function () {
        return benefits;
    };

    TileBenefits.prototype.get_benefit = function (resource_name) {
        return benefits.filter(function (b) {
            return b.Name == resource_name
        })[0];
    };

    TileBenefits.prototype.add_benefits = function (new_benefits) {
        new_benefits.forEach(function (new_benefit) {
            benefits.forEach(function (existing) {
                if (existing.Name == new_benefit.Name) {
                    existing.Amount += new_benefit.Amount;
                }
            })
        });
    };

    // Return the constructor.
    return TileBenefits;
});