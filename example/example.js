
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

myApp.factory('sampleMessage', [ function(){

  // example of message strings for the searchbox animation
  // the + and - characters are used to control the presence or absence of color
  var init_string = "+This is an example of what you can do with the fancy input module";
  return {
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
      console.log(search);
      console.log(suggestions[k]);
      if(suggestions[k].color.toLowerCase().indexOf(search.toLowerCase()) !== -1 || suggestions[k].string.toLowerCase().indexOf(search.toLowerCase()) !== -1 ){
        filtered_s.push(suggestions[k]);
      }
    }
    return filtered_s;
  };
});


myApp.controller('AcExampleController', [ '$scope', 'acfiDataInstance', 'acfiIntervalInstance', '$filter', 'sampleData', 'sampleMessage' ,
                                  function($scope ,  AcfiDataInstance,   AcfiIntervalInstance ,  $filter ,  sampleData ,  sampleMessage){

  $scope.AcfiData = AcfiDataInstance.get(1);
  $scope.AcfiInterval = AcfiIntervalInstance.get(1);
  $scope.sampleData = sampleData;



  // The text font is rescaled to fit the input box by default when typing
  // but there is added control for the animation
  $scope.AcfiData.resizeAnimation = true;  // default: false

  // initializing the suggestions types
  // klass is the css class used in the html, contents is an array of hash
  $scope.AcfiData.suggestion_types = [
    { "klass": "fruits", "contents": [], "name": 'Fruits' },
    { "klass": "vegetables", "contents": [], "name": 'Vegetables' }
  ];



  // Define the text that will be used in the animation
  $scope.AcfiData.initText(sampleMessage.init_string, sampleMessage.pause_string, sampleMessage.continue_array);

  // For now, the animation start is done in 2 steps for more control.
  $scope.allowAnimation = true;
  $scope.AcfiInterval.startAnimationInterval();


  // method called when typing
  // it should typically use the 'query' parameter to do a search and then fill the suggestion box
  $scope.$on("onQuerySuggestions", function (event, query) {
    console.log(query);
    $scope.AcfiData.suggestion_types[0].contents = $filter('suggestions')($scope.sampleData.fruits, query);
    $scope.AcfiData.suggestion_types[1].contents = $filter('suggestions')($scope.sampleData.vegetables, query);
    $scope.AcfiData.display = true;
    $scope.AcfiData.noResultDisplay = ($scope.AcfiData.displayedLength() === 0);
    $scope.allowAnimation = false;
  });


  // method called when pressing enter or selecting a suggestion
  // there are no parameters but the current input value is accessed via AcfiData.string
  $scope.$on('onSubmitQuery', function(){
    alert($scope.AcfiData.string + " selected");
    $scope.AcfiData.updateInput($scope.AcfiData.selected.color + " " + $scope.AcfiData.selected.string);
    $scope.AcfiData.display = false;
  });


  $scope.myViewMoreAction = function(){
    alert('In this action, you could open a modal window for instance to see all the suggestions');
    $scope.AcfiData.display = false;
  };

}]);

