
// Example of usage for the module ac-fancy-input

var myApp = angular.module('exampleApp',['ac-fancy-input']);

myApp.factory('sampleData',[ function(){

  // Example of data source, you can replace is by your own
  // WARNING: Each json node should contain at least 'string' as an attribute
  // it is what defines the main content of the selection by default
  return {
    fruits:
      [ { string: 'Strawberry', color: 'Red' }, { string: 'Banana', color: 'Yellow' }, { string: 'Apple', color: 'Green' } ],
    vegetables:
      [ { string: 'Zucchini Squash', color: 'Green' }, { string: 'Sweet Corn', color: 'Yellow' }, { string: 'Tomatoes', color: 'Red' } ]
  };
}]);


myApp.factory('sampleDataTwo',[ function(){

  // Example of data source, you can replace is by your own
  // WARNING: Each json node should contain at least 'string' as an attribute
  // it is what defines the main content of the selection by default
  return {
    fruits:
        [ { string: 'Strawberry', color: 'Red' }, { string: 'Banana', color: 'Yellow' }, { string: 'Apple', color: 'Green' } ],
    vegetables:
        [ { string: 'Zucchini Squash', color: 'Green' }, { string: 'Sweet Corn', color: 'Yellow' }, { string: 'Tomatoes', color: 'Red' } ]
  };
}]);


myApp.factory('sampleOptions', [ function(){

  // sample initialization options
  var init_string = "+This is an example of what you can do with the fancy input module";
  return {
    suggestion_types: [
      { "klass": "fruits", "contents": [], "name": 'Fruits' },
      { "klass": "vegetables", "contents": [], "name": 'Vegetables' }
    ],
    resizeAnimation: true,
    // example of message strings for the searchbox animation
    // the + and - characters are used to control the presence or absence of color
    init_string: init_string,
    pause_string: "",
    continue_array: [
      init_string,
      "You can customize this text animation",
      "and even mess with the -c+o-l+o-r+s",
      "Click and press any key to try out the -typeahead feature"
    ]
  };
}]);


// This filter simulates a real database search
myApp.filter("suggestions", function(){

  return function(suggestions, search){
    var filtered_s = [];
    for(var k = 0; k < suggestions.length;k++){
      if(suggestions[k].color.toLowerCase().indexOf(search.toLowerCase()) !== -1 || suggestions[k].string.toLowerCase().indexOf(search.toLowerCase()) !== -1 ){
        filtered_s.push(suggestions[k]);
      }
    }
    return filtered_s;
  };
});


myApp.controller('AcExampleController', [ '$scope', 'acfiDataInstance', 'acfiIntervalInstance', '$filter', 'sampleData', 'sampleOptions' ,
                                  function($scope ,  AcfiDataInstance,   AcfiIntervalInstance ,  $filter ,  sampleData ,  sampleOptions){

  $scope.sampleData = sampleData;

  // the init method creates the instance if it doesnt exist
  // it updates the options and returns the data instance otherwise
  $scope.AcfiData = AcfiDataInstance.init(1, sampleOptions);
  $scope.allowAnimation = true; // this could be set to false to block further animation
  $scope.AcfiInterval = AcfiIntervalInstance.init(1, true); // the true option starts the animation right away

  // method called when typing
  // it should typically use the 'query' parameter to do a search and then fill the suggestion box
  $scope.$on("onQuerySuggestions", function (event, query, id) {
    if(id===1){
      $scope.AcfiData.suggestion_types[0].contents = $filter('suggestions')($scope.sampleData.fruits, query);
      $scope.AcfiData.suggestion_types[1].contents = $filter('suggestions')($scope.sampleData.vegetables, query);
      $scope.AcfiData.show();
    }
  });

  // method called when pressing enter or selecting a suggestion
  // there are no parameters but the current input value is accessed via AcfiData.string
  $scope.$on('onSubmitQuery', function(event, id){
    if(id === 1){
      alert($scope.AcfiData.string + " selected");
      $scope.AcfiData.setInput($scope.AcfiData.selected.color + " " + $scope.AcfiData.selected.string);
    }
  });

  $scope.myViewMoreAction = function(){
    alert('In this action, you could open a modal window for instance to see all the suggestions');
    $scope.AcfiData.display = false;
  };

}]);



myApp.controller('AcExampleControllerTwo', [ '$scope', 'acfiDataInstance', 'acfiIntervalInstance', '$filter', 'sampleDataTwo', 'sampleOptions' ,
                                  function($scope ,  AcfiDataInstance,   AcfiIntervalInstance ,  $filter ,  sampleDataTwo ,  sampleOptions){

  $scope.sampleData = sampleDataTwo;

  // the init method creates the instance if it doesnt exist
  // it updates the options and returns the data instance otherwise
  $scope.AcfiData = AcfiDataInstance.init(2, sampleOptions);
  $scope.allowAnimation = true; // this could be set to false to block further animation
  $scope.AcfiInterval = AcfiIntervalInstance.init(2, true); // the true option starts the animation right away


  // method called when typing
  // it should typically use the 'query' parameter to do a search and then fill the suggestion box
  $scope.$on("onQuerySuggestions", function (event, query, id) {
    if(id === 2){
      $scope.AcfiData.suggestion_types[0].contents = $filter('suggestions')($scope.sampleData.fruits, query);
      $scope.AcfiData.suggestion_types[1].contents = $filter('suggestions')($scope.sampleData.vegetables, query);
      $scope.AcfiData.show();
    }
  });


  // method called when pressing enter or selecting a suggestion
  // there are no parameters but the current input value is accessed via AcfiData.string
  $scope.$on('onSubmitQuery', function(event, id){
    if(id===2){
      alert($scope.AcfiData.string + " selected");
      $scope.AcfiData.setInput($scope.AcfiData.selected.color + " " + $scope.AcfiData.selected.string);
      $scope.allowAnimation = false; // blocking further animation
    }
  });


  $scope.myViewMoreAction = function(){
    alert('In this action, you could open a modal window for instance to see all the suggestions');
    $scope.AcfiData.display = false;
  };
}]);

