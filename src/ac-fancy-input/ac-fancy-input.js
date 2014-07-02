// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Modules
var acfi = angular.module('ac-fancy-input',[]);

// Author: Alexandre FC Coppens
// Date of first iteration: Fri 20 Jun 2014 15:29:06 EDT
// Purpose: directive to create an advanced typeahead combined with an animated search input
//
// To Do:
// - Consistent object names and configuration
// - Remove $rootScope usage where not needed
// - Package it with bower
// - Write a short example with some css
// - Singleton => Multiple instances
// - Extract some of the classes