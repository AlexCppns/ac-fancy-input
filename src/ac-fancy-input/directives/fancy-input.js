// ****************************************************************************************************************** //

// ************************************** controller definition for search-box ************************************** //

acfi.controller('acfiSearchboxController', [ '$scope', '$window', 'acfiIntervalInstance', 'acfiDataInstance', function($scope, $window, AcfiIntervalInstance, AcfiDataInstance) {

  $window.focus();

  $scope.AcfiData = AcfiDataInstance.init($scope.acId);
  $scope.AcfiInterval = AcfiIntervalInstance.init($scope.acId);

  $window.onblur = function (){
    $scope.AcfiInterval.inFocus = false;
  };

  $window.onfocus = function (){
    $scope.AcfiInterval.inFocus = true;
  };


  $scope.$on('onInitInterval', function (event, id) {
    if(id === $scope.acId){ $scope.AcfiData.init(); }
  });


  $scope.$on('onPauseInterval', function(event, loopIndex, id){
    if(id === $scope.acId){ $scope.AcfiData.pause(loopIndex); }
  });


  $scope.$on('onContinueInterval', function(event, id){
    if(id === $scope.acId){ $scope.AcfiData.continueC(); }
  });


  $scope.$on('onStopInterval', function(event, id){
    if(id === $scope.acId){
      $scope.AcfiData.string = "";
      $scope.AcfiData.data_before = [];
    }
  });
}]);


// ****************************************************************************************************************** //

// ******************************************* fancy input directives *********************************************** //

acfi.directive('acFancyInput', [ '$rootScope', 'acfiCaret', "$timeout", 'acfiDataInstance', function($rootScope, acfiCaret, $timeout, AcfiDataInstance) {

  var dummy_transclude = '<div data-ng-transclude></div>';
  var before_template = '<div class="acfi-before" data-acfi-before></div>';
  var after_template = '<span data-acfi-after></span>';

  var input_template = '<input tabindex="{{acId}}" id="acfi{{acId}}" class="anim-field" type="text" maxlength="{{acMaxLength}}" spellcheck="false"' +
                       ' data-ng-class="{\'no-opacity\': AcfiData.animating == false}" data-ng-style="AcfiData.font_style"' +
                       ' data-ng-model="AcfiData.string">';

  var overlay_template =  '<div data-ng-style="AcfiData.font_style" class="fancyInputFiller">' +
                          '<span data-ng-repeat="char in AcfiData.data_before track by $index" data-ng-class="{colored: char[0] == true}">{{char[1]}}</span>' +
                          '<b class="caret" data-ng-hide="$root.hideCaret">&#8203;</b>' +
                          '<span data-ng-repeat="char_2 in AcfiData.data_after track by $index">{{char_2}}</span>' +
                          '</div>';

  var template = '<div data-ng-class="{ focus: AcfiData.searchFieldIsFocus || AcfiData.display }">';
  template += dummy_transclude + before_template + input_template + overlay_template + after_template;
  template += '</div>';



  return {
    restrict: "A",
    template: template,
    replace: true,
    transclude: true,
    controller: 'acfiSearchboxController',
    scope: {
      acAnimate: "=?",
      acId: "=acFancyInput",
      acMaxLength: "=?",
      acOptions: "=?"
    },
    link: function (scope, element) {

      scope.acMaxLength = scope.acMaxLength || 70;
      if(scope.acAnimate===undefined){ scope.acAnimate = true; }

      var input = angular.element(element.children()[2]);

      scope.filterTextTimeout = {};
      scope.acfiCaret = acfiCaret;
      scope.AcfiData = AcfiDataInstance.init(scope.acId, scope.acOptions);


      input.bind("keyup select mouseup cut paste", function (e) {
        if(e.keyCode !== 13){ scope.processBinding(e, this); }
      });


      scope.$on("onEnterQuery", function(){ element[0].blur(); });


      input.on('blur', function() {
        scope.$apply(function() {
          scope.AcfiData.decideToStart(scope.acAnimate);
          scope.AcfiData.searchFieldIsFocus = false;
        });
      });


      input.on('focus', function() {
        scope.$apply(function() {
          scope.AcfiData.decideToStop();
          scope.AcfiData.searchFieldIsFocus = true;
        });
      });


      input.bind("keydown", function(e){
        if(e.keyCode === 13){
          $rootScope.$broadcast('onSubmitQuery', scope.acId);
        }else{
          if (e.keyCode === 38 || e.keyCode === 40) {
            var direction = +1;
            if (e.keyCode === 38){ direction = -1; }
            $rootScope.$broadcast("onKeyUpAndDown", direction, scope.acId);
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
          scope.AcfiData.processBinding(input_str, pos, input.val());
        });
      };


      scope.$watch(function(){ return scope.AcfiData.string; }, function (value) {
        scope.AcfiData.handleWatch(value);
      });
    }
  };
}]);


var acfi_input_template_directive = function(string){
  return {
    transclude: true,
    restrict: 'A',
    require: '^acFancyInput',
    link: function(s, element, a, controller, transclude){
      element.remove();
      controller['renderAcfi' + string + 'Template'] = transclude;
    }
  };
};


var acfi_input_transclude_directive = function(string){
  return {
    restrict: 'A',
    require: '^acFancyInput',
    link: function(scope, element, a, controller){
      if(controller['renderAcfi' + string + 'Template'] !== undefined){
        controller['renderAcfi' + string + 'Template'](scope, function(dom){
          element.append(dom);
        });
      }
    }
  };
};

acfi.directive('acfiBeforeTemplate', function(){ return acfi_input_template_directive('Before'); });
acfi.directive('acfiBefore', function(){ return acfi_input_transclude_directive('Before'); });
acfi.directive('acfiAfterTemplate', function(){ return acfi_input_template_directive('After'); });
acfi.directive('acfiAfter', function(){ return acfi_input_transclude_directive('After'); });


