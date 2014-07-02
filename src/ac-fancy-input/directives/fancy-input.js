// ****************************************************************************************************************** //

// ************************************** controller definition for search-box ************************************** //

acfi.controller('acfiSearchboxController', [ '$scope', '$window', 'acfiInterval', 'acfiData', function($scope, $window, AcfiInterval, AcfiData) {

  $window.focus();

  $scope.AcfiData = AcfiData;
  $scope.AcfiInterval = AcfiInterval;

  $window.onblur = function (){
    $scope.AcfiInterval.inFocus = false;
  };

  $window.onfocus = function (){
    $scope.AcfiInterval.inFocus = true;
  };


  $scope.$on('onInitInterval', function () {
    $scope.AcfiData.init();
  });


  $scope.$on('onPauseInterval', function(event, loopIndex){
    $scope.AcfiData.pause(loopIndex);
  });


  $scope.$on('onContinueInterval', function(){
    $scope.AcfiData.continueC();
  });


  $scope.$on('onStopInterval', function(){
    $scope.AcfiData.string = "";
    $scope.AcfiData.data_before = [];
  });
}]);


// ****************************************************************************************************************** //

// ******************************************* fancy input directives *********************************************** //

acfi.directive('acFancyInput', [ '$rootScope', 'acfiCaret', "$timeout", 'acfiData', function($rootScope, acfiCaret, $timeout, AcfiData) {

  var template = '<div><input tabindex="2" id="inputAnimation" class="anim-field" type="text" maxlength="70" spellcheck="false"';
  template += ' data-ng-class="{\'no-opacity\': AcfiData.animating == false}")';
  template += ' data-ng-style="AcfiData.font_style"';
  template += ' data-ng-model="AcfiData.string">';
  template += '<div data-ng-style="AcfiData.font_style" class="fancyInputFiller">';
  template += '<span data-ng-repeat="char in AcfiData.data_before track by $index" data-ng-class="{colored: char[0] == true}">{{char[1]}}</span>';
  template += '<b class="caret" data-ng-hide="$root.hideCaret">&#8203;</b>';
  template += '<span data-ng-repeat="char_2 in AcfiData.data_after track by $index">{{char_2}}</span>';
  template += '</div></div>';

  return {
    restrict: "A",
    template: template,
    replace: true,
    scope: {
     animate: "=animate"
    },

    link: function (scope, element, attrs) {

      $rootScope.searchFieldIsFocus = false;

      var input = element.children(1);
      scope.filterTextTimeout = {};
      scope.acfiCaret = acfiCaret;
      scope.AcfiData = AcfiData;

      input.bind("keyup select mouseup cut paste", function (e) {
        if(e.keyCode !== 13){ scope.processBinding(e, this); }
      });

      scope.$on("onEnterQuery", function(){ element[0].blur(); });

      input.on('blur', function() {
        scope.$apply(function() {
          scope.AcfiData.decideToStart(scope.animate);
          $rootScope.searchFieldIsFocus = false;
        });
      });

      input.on('focus', function() {
        scope.$apply(function() {
          scope.AcfiData.decideToStop();
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
            scope.$apply(function () { scope.AcfiData.selected_index = 10000; });
            scope.processBinding(e, this);
          }
        }
      });

      scope.processBinding = function(e, el){

        scope.$apply(function () {
          var input_str = input.val().replace(/\s+/g, "\u00A0").split("").reverse();
          var pos = scope.acfiCaret.setCaret(el, true, e);
          scope.AcfiData.processBinding(input_str,pos,input.val());
        });
      };

      // looks like I can only watch a ngModel or expression
      scope.$watch(function(){ return scope.AcfiData.string; }, function (value) {
        if(scope.AcfiData.watching === true){
          if(scope.filterTextTimeout){ $timeout.cancel(scope.filterTextTimeout); }
          scope.filterTextTimeout = $timeout(function() {
            scope.AcfiData.checkFontThreshold();
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

