
// ****************************************************************************************************************** //

// ******************************** controller definition for search-box-suggestions ******************************** //


acfi.controller('acfiSuggestionsController',[ 'acfiData', '$scope','$q', function(AcfiData, $scope, $q){

  $scope.AcfiData = AcfiData;

  $scope.$on("onKeyUpAndDown", function(event, direction){
    $scope.deferWatching().then(function(success){
      if(success){
        $scope.AcfiData.display = true;
        $scope.AcfiData.onKeyUpAndDown(event, direction);
      }
    });
  });

  $scope.$on("onCloseDisplay", function(){

    // This apply is important (called from directive):
    $scope.$apply(function(){
      $scope.AcfiData.display = false;
    });
  });

  // Not sure if this is still necessary
  $scope.deferWatching = function(){
    var d = $q.defer();
    $scope.AcfiData.watching = false;
    d.resolve($scope.AcfiData.watching === false);
    return d.promise;
  };
}]);


// ****************************************************************************************************************** //

// **************************************** fancy input suggestions directives ************************************** //


acfi.directive('acFancyInputSuggestions', [ '$rootScope', function($rootScope){

  var header_template = '<div ng-transclude></div><span acfi-header></span>';

  var ng_repeat_template = '<div class="type-row clearfix" data-ng-class="suggestion_type.klass" data-ng-class-even="\'even\'" data-ng-class-odd="\'odd\'" data-ng-repeat="suggestion_type in AcfiData.suggestion_types">' +
      '<div class="type-name-wrapper" data-ng-show="suggestion_type.contents.length > 0">' +
      '<div class="type-name small semi-bold">{{suggestion_type.name}}</div>' +
      '</div>'+
      '<div class="type-content" data-ng-show="suggestion_type.contents.length > 0">' +
      '<ul>' +
      '<li data-ng-repeat="content in suggestion_type.contents" ' +
      'data-ng-class="{ selected: content.selected}" ' +
      'data-ng-mouseover="AcfiData.selectSuggestion($parent.$index, $index)" ' +
      'data-ng-click="AcfiData.selectSuggestion($parent.$index, $index); acfiQueryAction()">' +
      '<div class="row-wrapper light clearfix" acfi-content></div>'+
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>';

  var footer_template = '<div class="view-more">' +
      '<a data-ng-show="AcfiData.noResultDisplay == false && acSuggestionCount > AcfiData.suggestionDisplayLimit" ' +
      'data-ng-click="acfiViewMoreAction($event)">' +
      '<div acfi-view-more></div>' +
      '</a>' +
      '<a data-ng-show="AcfiData.noResultDisplay == true" class="no-results"><div acfi-no-results></div></a>'+
      '</div>';


  var template = '<div id="input-suggestion-box" class="input-suggestion" data-ng-show="AcfiData.display == true" acfi-reset-display>';
  template += header_template + ng_repeat_template + footer_template;
  template += '</div>';

  return {
    scope: {
      acfiViewMoreAction: '=acViewMoreAction',
      acSuggestionCount: '=?'
    },
    template: template,
    transclude: true,
    controller: 'acfiSuggestionsController',
    link: function(scope, e, attrs){
      if(attrs.acSuggestionCount===undefined){
        scope.acSuggestionCount = 0;
      }

      scope.acfiQueryAction = function(){
        $rootScope.$broadcast('onSubmitQuery');
      };
    }
  };
}]);


var acfi_template_directive = function(string){
  return {
    transclude: true,
    restrict: 'A',
    require: '^acFancyInputSuggestions',
    link: function(s, element, a, controller, transclude){
      element.remove();
      controller['renderAcfi'+string+'Template'] = transclude;
    }
  };
};

var acfi_transclude_directive = function(string){
  return {
    restrict: 'A',
    require: '^acFancyInputSuggestions',
    link: function(scope, element, a, controller){
      if(controller['renderAcfi'+string+'Template']!==undefined){
        controller['renderAcfi'+string+'Template'](scope, function(dom){
          element.append(dom);
        });
      }
    }
  };
};

acfi.directive('acfiHeaderTemplate', function(){ return acfi_template_directive('Header'); });
acfi.directive('acfiHeader', function(){ return acfi_transclude_directive('Header'); });
acfi.directive('acfiContentTemplate', function(){ return acfi_template_directive('Content'); });
acfi.directive('acfiContent', function(){ return acfi_transclude_directive('Content'); });
acfi.directive('acfiNoResultsTemplate', function(){ return acfi_template_directive('NoResults'); });
acfi.directive('acfiNoResults', function(){ return acfi_transclude_directive('NoResults'); });
acfi.directive('acfiViewMoreTemplate', function(){ return acfi_template_directive('ViewMore'); });
acfi.directive('acfiViewMore', function(){ return acfi_transclude_directive('ViewMore'); });