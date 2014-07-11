
// Author: Alexandre FC Coppens
// Date of first iteration: Fri 20 Jun 2014 15:29:06 EDT
// Purpose: directive to create an advanced typeahead combined with an animated search input
//

// Modules
var acfi = angular.module('ac-fancy-input',[]);

acfi.run([ '$templateCache','acfiTemplates', function($templateCache, acfiTemplates){

  $templateCache.put('templates/acfi/suggestions.html', acfiTemplates.getSuggestions());
  $templateCache.put('templates/acfi/fancy-input.html', acfiTemplates.getInput());
}]);
