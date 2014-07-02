var myApp = angular.module('exampleApp',['ac-fancy-input']);

myApp.factory('sampleData',[function(){

  // Example of data source, you can replace is by your own
  return {
    fruits:
      [ { string: 'strawberry', color: 'red' }, { string: 'banana', color: 'yellow' }, { string: 'green Apple', color: 'green' } ],
    vegetables:
      [ { string: 'Zucchini Squash', color: 'green' }, { string: 'Sweet Corn', color: 'yellow' }, { string: 'tomatoes', color: 'red' } ]
  };
}]);

myApp.factory('sampleMessage', [ function(){

  // example of message strings for the searchbox animation
  // the + and - characters are used to control the presence or absence of color
  return {
    init_string: "+This is a example of fancy input",
    pause_string: "",
    continue_array: [
      "This is a example of fancy input",
      "You can customize the content the way you want",
      "And even change the -c+o-l+o-r+s"
    ]
  };
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


myApp.controller('AcExampleController', [ '$scope', 'acfiData', 'acfi-intervalManager', '$filter', 'sampleData', 'sampleMessage' , function($scope, AcfiData, intervalManager, $filter, sampleData, sampleMessage){

  $scope.AcfiData = AcfiData;
  $scope.intervalManager = intervalManager;
  $scope.sampleData = sampleData;

  $scope.AcfiData.suggestion_types = [
    { "klass": "fruits", "contents": [], "name": 'Fruits' },
    { "klass": "vegetables", "contents": [], "name": 'Vegetables' }
  ];
  $scope.allowAnimation = true;

  $scope.AcfiData.initText(sampleMessage.init_string, sampleMessage.pause_string, sampleMessage.continue_array);

  $scope.intervalManager.startAnimationInterval();

  $scope.$on("onQuerySuggestions", function (event, query) {
    $scope.AcfiData.suggestion_types[0].contents = $filter('suggestions')($scope.sampleData.fruits, query);
    $scope.AcfiData.suggestion_types[1].contents = $filter('suggestions')($scope.sampleData.vegetables, query);
    $scope.AcfiData.display = true;
    $scope.AcfiData.noResultDisplay = ($scope.AcfiData.displayedLength()===0);
    $scope.allowAnimation = false;
  });
}]);

