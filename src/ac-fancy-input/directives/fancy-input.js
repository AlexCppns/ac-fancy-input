// ****************************************************************************************************************** //

// ************************************** controller definition for search-box ************************************** //

acfi.controller('acfi-SearchboxController', [ '$rootScope', '$scope', '$window', 'acfi-intervalManager', 'acfi-searchBoxData', function($rootScope, $scope, $window, intervalManager, SearchBoxData) {

  $window.focus();

  $scope.searchBoxData = SearchBoxData;
  $scope.intervalManager = intervalManager;

  $window.onblur = function (){
    $scope.intervalManager.inFocus = false;
  };

  $window.onfocus = function (){
    $scope.intervalManager.inFocus = true;
  };


  $scope.$on('onInitInterval', function () {
    $scope.searchBoxData.init($scope.intervalManager);
  });


  $scope.$on('onPauseInterval', function(event, loopIndex){
    $scope.searchBoxData.pause(loopIndex);
  });


  $scope.$on('onContinueInterval', function(){
    $scope.searchBoxData.continueC($scope.intervalManager);
  });


  $scope.$on('onStopInterval', function(){
    $scope.searchBoxData.string = "";
    $scope.searchBoxData.data_before = [];
  });
}]);


// ****************************************************************************************************************** //

// ******************************************* fancy input directives *********************************************** //

acfi.directive('acFancyInput', [ '$rootScope', 'acfi-writerManager', "$timeout", 'acfi-searchBoxData', function($rootScope, writerManager, $timeout, SearchBoxData) {

  var template = '<div><input tabindex="2" id="inputAnimation" class="anim-field" type="text" maxlength="70" spellcheck="false"';
  template += ' data-ng-class="{\'no-opacity\': SearchBoxData.animating == false}")';
  template += ' data-ng-style="SearchBoxData.font_style"';
  template += ' data-ng-model="SearchBoxData.string">';
  template += '<div data-ng-style="SearchBoxData.font_style" class="fancyInputFiller">';
  template += '<span data-ng-repeat="char in SearchBoxData.data_before track by $index" data-ng-class="{colored: char[0] == true}">{{char[1]}}</span>';
  template += '<b class="caret" data-ng-hide="$root.hideCaret">&#8203;</b>';
  template += '<span data-ng-repeat="char_2 in SearchBoxData.data_after track by $index">{{char_2}}</span>';
  template += '</div></div>';

  return {
    restrict: "A",
    template: template,
    replace: true,

    link: function (scope, element, attrs) {

      var input = element.children(1);
      scope.filterTextTimeout = {};
      scope.writerManager = writerManager;
      scope.searchBoxData = SearchBoxData;

      input.bind("keyup select mouseup cut paste", function (e) {
        if(e.keyCode !== 13){ scope.processBinding(e, this); }
      });

      scope.$on("onEnterQuery", function(){ element[0].blur(); });

      input.on('blur', function() {
        scope.$apply(function() {
          var extra_condition = $rootScope.results === false;
          scope.searchBoxData.decideToStart(extra_condition);
          $rootScope.searchFieldIsFocus = false;
        });
      });

      input.on('focus', function() {
        scope.$apply(function() {
          scope.SearchBoxData.decideToStop();
          $rootScope.searchFieldIsFocus = true;
        });
      });


      input.bind("keydown", function(e){
        if(e.keyCode === 13){
          $rootScope.$broadcast('onSubmitQuery');
        }else{
          if (e.keyCode === 38 || e.keyCode === 40) {
            var direction = +1;
            if (e.keyCode === 38){ direction = -1; }
            $rootScope.$broadcast("onKeyUpAndDown", direction);
          }else{
            // reset selection if typing
            scope.$apply(function () { scope.searchBoxData.selected_index = 10000; });
            scope.processBinding(e, this);
          }
        }
      });

      scope.processBinding = function(e, el){

        scope.$apply(function () {
          var input_str = input.val().replace(/\s+/g, "\u00A0").split("").reverse();
          var pos = scope.writerManager.setCaret(el, true, e);
          scope.searchBoxData.processBinding(input_str,pos,input.val());
        });
      };

      // looks like I can only watch a ngModel or expression
      scope.$watch(function(){ return scope.searchBoxData.string; }, function (value) {
        if(scope.searchBoxData.watching === true){
          if(scope.filterTextTimeout){ $timeout.cancel(scope.filterTextTimeout); }
          scope.filterTextTimeout = $timeout(function() {
            scope.searchBoxData.checkFontThreshold();
            $rootScope.$broadcast("onQuerySuggestions", value);
          }, 140);
        }
      });
    }
  };
}]);


acfi.directive('acfiResetDisplay', ['$rootScope', '$window', function($rootScope, $window){
  return {
    link: function(scope, element){
      var w = angular.element($window);
      element.bind('click', function(e){ e.stopPropagation(); });
      w.bind('click', function(e){ $rootScope.$broadcast("onCloseDisplay"); });
    }
  };
}]);

