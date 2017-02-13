angular.module('myApp').factory('gameServiceFactory', function () {

    var Giant = (function () {
        // Each giant has slots for ambassadors.
        var slots;
        // Each giant has some abilities.
        var abilities;

        function Giant(name) {
            this.name = name;
            this.slots = [new GiantSlot(), new GiantSlot(), new GiantSlot(), new GiantSlot()];
        };
        return Giant;
    })();

    var GiantSlot = (function () {
        //  Each slot can have one ambassador.
        var ambassador;

        function GiantSlot() {
        };
        return GiantSlot;
    })();

    var Ambassador = (function () {
        function Ambassador(name) {
            this.name = name;
        };
        return Ambassador;
    })();

    var Resource = (function () {
        function Resource(name) {
            this.name = name;
        };
        return Resource;
    })();

    var GiantAbility = (function () {
        function GiantAbility(name) {
            this.name = name;
        };
        return GiantAbility;
    })();

    var service = {
        all_giants: [new Giant("forest"), new Giant("ocean")],
        all_ambassadors: [new Ambassador("forest"), new Ambassador("swamp"), new Ambassador("desert")],
        all_resources: [
            new Resource("food"), new Resource("wealth"), new Resource("technology"),
            new Resource("awe"), new Resource("danger"), new Resource("natura")]
    }
    return service;
});