'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('Giant', function() {

    beforeEach(module('myApp'));

    var $controller;

    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('$scope.X', function() {
        it('Y', function() {
            var $scope = {};
            var controller = $controller('Giant', { $scope: $scope });
            expect($scope.test[0]).toEqual(1);
        });
    });

  // it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
  //   browser.get('index.html');
  //   expect(browser.getLocationAbsUrl()).toMatch("/view1");
  // });
  //
  //
  // describe('view1', function() {
  //
  //   beforeEach(function() {
  //     browser.get('index.html#!/view1');
  //   });
  //
  //
  //   it('should render view1 when user navigates to /view1', function() {
  //     expect(element.all(by.css('[ng-view] p')).first().getText()).
  //       toMatch(/partial for view 1/);
  //   });
  //
  // });
  //
  //
  // describe('view2', function() {
  //
  //   beforeEach(function() {
  //     browser.get('index.html#!/view2');
  //   });
  //
  //
  //   it('should render view2 when user navigates to /view2', function() {
  //     expect(element.all(by.css('[ng-view] p')).first().getText()).
  //       toMatch(/partial for view 2/);
  //   });
  //
  // });
});
