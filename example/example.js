var myApp = angular.module('exampleApp',['ac-fancy-input']);

myApp.controller('AcExampleController', ['$rootScope', '$scope', 'acfi-searchBoxData', 'acfi-intervalManager', '$filter' , function($rootScope, $scope, SearchBoxData, intervalManager,$filter){

  $scope.SearchBoxData = SearchBoxData;
  $scope.intervalManager = intervalManager;

  $rootScope.searchFieldIsFocus = false;

  $scope.example_fruits = [
    { string: 'strawberry', color: 'red' },
    { string: 'banana', color: 'yellow' },
    { string: 'green Apple', color: 'green' }
  ];

  $scope.example_vegetables = [

    { string: 'Zucchini Squash', color: 'green' },
    { string: 'Sweet Corn', color: 'yellow' },
    { string: 'tomatoes', color: 'red' }
  ];

  $scope.SearchBoxData.suggestion_types = [
    { "klass": "fruits", "contents": [], "name": 'Fruits' },
    { "klass": "vegetables", "contents": [], "name": 'Vegetables' }
  ];

  var init_string = "+This is a example of fancy input";
  var pause_string  = "+";
  var continue_array = [
    "This is a example of fancy input",
    "You can customize the content the way you want",
    "And even +change the colors"
  ];

  $scope.SearchBoxData.initText(init_string, pause_string, continue_array);
  $scope.intervalManager.startAnimationInterval();
  $rootScope.results = false;


  $scope.$on("onQuerySuggestions", function (event, query) {
    $scope.SearchBoxData.suggestion_types[0].contents = $filter('suggestions')($scope.example_fruits, query);
    $scope.SearchBoxData.suggestion_types[1].contents = $filter('suggestions')($scope.example_vegetables, query);
    $scope.SearchBoxData.display = true;
    $scope.SearchBoxData.noResultDisplay = ($scope.SearchBoxData.displayedLength()===0);
  });
}]);

myApp.filter("suggestions", function(){
  return function(suggestions, search){

    var filtered_s = [];
    for(var k = 0; k < suggestions.length;k++){
      if(suggestions[k].color.indexOf(search.toLowerCase()) !== -1 || suggestions[k].string.indexOf(search.toLowerCase()) !== -1 ){
        filtered_s.push(suggestions[k]);
      }
    }
    return filtered_s;
  };
});