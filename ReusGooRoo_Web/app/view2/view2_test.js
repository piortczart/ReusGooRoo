'use strict';

describe('myApp.view2 module', function () {

    beforeEach(module('myApp.view2'));

    describe('myApp.view2 controller', function () {

        it('should ....', inject(function ($controller) {
            var giant = $controller('Giant', {
                $scope: scope
            });
            expect(giant).toBeDefined();
        }));

    });
});