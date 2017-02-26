angular.module('myApp').factory('CombinationsService', function () {

    var combinations_result;

    function calculate_combinations(items, max_index, current_inex, list_so_far){
        if (list_so_far === undefined){
            list_so_far = [];
        }

        items.forEach(function (item) {
            //list_so_far.splice(current_inex, 0, item);
            list_so_far[current_inex] = item;

            if (current_inex + 1 <= max_index){
                calculate_combinations(items, max_index, current_inex + 1, list_so_far);
            } else{
                var array_copy = list_so_far.slice();
                combinations_result.push(list_so_far.slice())
            }
        })
    }

    function get_combinations(items, size) {
        combinations_result = [];
        calculate_combinations(items, size - 1, 0);
        return combinations_result;
    }

    return {
        get_combinations: get_combinations
    };
});