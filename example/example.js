var myApp = angular.module('exampleApp',['ac-fancy-input']);

myApp.controller('AcExampleController', [ '$scope', 'acfi-searchBoxData', 'acfi-intervalManager' , function($scope, SearchBoxData, intervalManager){

  $scope.SearchBoxData = SearchBoxData;
  $scope.intervalManager = intervalManager;
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
}]);