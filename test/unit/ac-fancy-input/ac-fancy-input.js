'use strict';

// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('ac-fancy-input', function() {

    var module;
    var dependencies;
    dependencies = [];

    var hasModule = function(module) {
        return dependencies.indexOf(module) >= 0;
    };

    beforeEach(function() {

        // Get module
        module = angular.module('ac-fancy-input');
        dependencies = module.requires;
    });

    it('should load config module', function() {
        expect(hasModule('ac-fancy-input.config')).toBeTruthy();
    });

    

    
    it('should load directives module', function() {
        expect(hasModule('ac-fancy-input.directives')).toBeTruthy();
    });
    

    
    it('should load services module', function() {
        expect(hasModule('ac-fancy-input.services')).toBeTruthy();
    });
    

});
