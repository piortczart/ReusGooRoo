angular.module('myApp').factory('GiantAbilityWithLevel', function () {
    function GiantAbilityWithLevel(ability, level) {
        this.ability = ability;
        this.level = level;
    };
    return GiantAbilityWithLevel;
});

angular.module('myApp').factory('GiantAspectWithLevel', function () {
    function GiantAspectWithLevel(aspect, level) {
        this.aspect = aspect;
        this.level = level;
    };
    return GiantAspectWithLevel;
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

    NaturalSource.get_by_name = function (name, sources){
        return sources.find(function (source) {
            return source.Name == name;
        });
    }

    // Return the constructor.
    return NaturalSource;
});

angular.module('myApp').factory('TileBenefits', function () {

    var benefits;

    function TileBenefits(resources) {
        // We have to make a clone here to make sure all TileBenefits don't work on the same reources object.
        this.benefits = JSON.parse(JSON.stringify(resources));
        this.benefits.forEach(function (benefit) {
            benefit.Amount = 0;
        })
    }

    TileBenefits.prototype.get_benefits = function () {
        return this.benefits;
    };

    TileBenefits.prototype.get_benefit = function (resource_name) {
        return this.benefits.filter(function (b) {
            return b.Name.toUpperCase() == resource_name.toUpperCase()
        })[0];
    };

    TileBenefits.prototype.add_benefits = function (new_benefits) {
        var benefits = this.benefits;
        new_benefits.forEach(function (new_benefit) {
            benefits.forEach(function (existing) {
                if (existing.Name.toUpperCase() == new_benefit.Name.toUpperCase()) {
                    existing.Amount += new_benefit.Amount;
                }
            })
        });
    };

    // Return the constructor.
    return TileBenefits;
});