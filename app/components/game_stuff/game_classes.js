var Giant = (
    function(){
        // Each giant has slots for ambassadors.
        var slots;
        function Giant(name) {
            this.name = name;
            this.slots = [new GiantSlot(), new GiantSlot(), new GiantSlot(), new GiantSlot()];
        };

        return Giant;
    })();

var GiantSlot = (
    function(){
        //  Each slot can have one ambassador.
        var ambassador;

        function GiantSlot() { };

        return GiantSlot;
    })();

var Ambassador = (
    function(){
        function Ambassador(name) {
            this.name = name;
        };

        return Ambassador;
    })();

var all_giants = [new Giant("forest"), new Giant("ocean")];
var all_ambassadors = [new Ambassador("forest"), new Ambassador("swamp"), new Ambassador("desert")];