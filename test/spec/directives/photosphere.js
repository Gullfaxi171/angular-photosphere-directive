'use strict';

describe('Directive: photosphere', function () {

  // load the directive's module
  beforeEach(module('photosphereApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<photosphere></photosphere>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the photosphere directive');
  }));
});
