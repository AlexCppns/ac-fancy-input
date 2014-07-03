(function(window, document) {

// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Modules
var acfi = angular.module('ac-fancy-input',[]);

// Author: Alexandre FC Coppens
// Date of first iteration: Fri 20 Jun 2014 15:29:06 EDT
// Purpose: directive to create an advanced typeahead combined with an animated search input
//
// To Do:
// - Consistent object names and configuration
// - Remove $rootScope usage where not needed
// - Singleton => Multiple instances
// - Extract some of the css classes/Clean up the css
// - Move/Remove application specific code

// ****************************************************************************************************************** //

// ******************************** controller definition for search-box-suggestions ******************************** //


acfi.controller('acfiSuggestionsController',[ 'acfiDataInstance', '$scope','$q', function(AcfiDataInstance, $scope, $q){

  $scope.AcfiData = AcfiDataInstance.get($scope.acId);

  $scope.$on("onKeyUpAndDown", function(event, direction, id){
    if($scope.acId===id){
      $scope.deferWatching().then(function(success){
        if(success){
          $scope.AcfiData.display = true;
          $scope.AcfiData.onKeyUpAndDown(event, direction);
        }
      });
    }
  });

  $scope.$on("onCloseDisplay", function(event, id){
    if($scope.acId===id){
      // This apply is important (called from directive):
      $scope.$apply(function(){
        $scope.AcfiData.display = false;
      });
    }
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


acfi.directive('acFancyInputSuggestions', [ '$rootScope','$window', function($rootScope, $window){

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


  var template = '<div id="input-suggestion-box" class="input-suggestion" data-ng-show="AcfiData.display == true">';
  template += header_template + ng_repeat_template + footer_template;
  template += '</div>';

  return {
    scope: {
      acfiViewMoreAction: '=acViewMoreAction',
      acSuggestionCount: '=?',
      acId: '=acId'
    },
    template: template,
    transclude: true,
    controller: 'acfiSuggestionsController',
    link: function(scope, element, attrs){
      if(attrs.acSuggestionCount===undefined){
        scope.acSuggestionCount = 0;
      }

      scope.acfiQueryAction = function(){
        $rootScope.$broadcast('onSubmitQuery', scope.acId);
      };

      var w = angular.element($window);
      element.bind('click', function(e){ e.stopPropagation(); });
      w.bind('click', function(e){ $rootScope.$broadcast("onCloseDisplay", scope.acId); });
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


// ****************************************************************************************************************** //

// ************************************** controller definition for search-box ************************************** //

acfi.controller('acfiSearchboxController', [ '$scope', '$window', 'acfiIntervalInstance', 'acfiDataInstance', function($scope, $window, AcfiIntervalInstance, AcfiDataInstance) {



  $window.focus();

  $scope.AcfiData = AcfiDataInstance.get($scope.acId);
  $scope.AcfiInterval = AcfiIntervalInstance.get($scope.acId);

  $window.onblur = function (){
    $scope.AcfiInterval.inFocus = false;
  };

  $window.onfocus = function (){
    $scope.AcfiInterval.inFocus = true;
  };


  $scope.$on('onInitInterval', function (event, id) {
    if(id == $scope.acId){ $scope.AcfiData.init(); }
  });


  $scope.$on('onPauseInterval', function(event, loopIndex, id){
    if(id == $scope.acId){ $scope.AcfiData.pause(loopIndex); }
  });


  $scope.$on('onContinueInterval', function(event, id){
    if(id == $scope.acId){ $scope.AcfiData.continueC(); }
  });


  $scope.$on('onStopInterval', function(event, id){
    if(id == $scope.acId){
      $scope.AcfiData.string = "";
      $scope.AcfiData.data_before = [];
    }
  });
}]);


// ****************************************************************************************************************** //

// ******************************************* fancy input directives *********************************************** //

acfi.directive('acFancyInput', [ '$rootScope', 'acfiCaret', "$timeout", 'acfiDataInstance', function($rootScope, acfiCaret, $timeout, AcfiDataInstance) {

  var template = '<div data-ng-class="{ focus: $root.searchFieldIsFocus || AcfiData.display }">' +
                 '<div ng-transclude></div><div class="acfi-before" acfi-before></div>' +
                 '<input tabindex="2" id="inputAnimation" class="anim-field" type="text" maxlength="70" spellcheck="false"';
  template += ' data-ng-class="{\'no-opacity\': AcfiData.animating == false}")';
  template += ' data-ng-style="AcfiData.font_style"';
  template += ' data-ng-model="AcfiData.string">';
  template += '<div data-ng-style="AcfiData.font_style" class="fancyInputFiller">';
  template += '<span data-ng-repeat="char in AcfiData.data_before track by $index" data-ng-class="{colored: char[0] == true}">{{char[1]}}</span>';
  template += '<b class="caret" data-ng-hide="$root.hideCaret">&#8203;</b>';
  template += '<span data-ng-repeat="char_2 in AcfiData.data_after track by $index">{{char_2}}</span>';
  template += '</div>';
  template += '<span acfi-after></span>';
  template += '</div>';

  return {
    restrict: "A",
    template: template,
    replace: true,
    transclude: true,
    controller: 'acfiSearchboxController',
    scope: {
     acAnimate: "=acAnimate",
     acId: "=acId"
    },

    link: function (scope, element, attrs) {

      $rootScope.searchFieldIsFocus = false;

      var input = angular.element(element.children()[2]);

      scope.filterTextTimeout = {};
      scope.acfiCaret = acfiCaret;
      scope.AcfiData = AcfiDataInstance.get(scope.acId);

      input.bind("keyup select mouseup cut paste", function (e) {
        if(e.keyCode !== 13){ scope.processBinding(e, this); }
      });

      scope.$on("onEnterQuery", function(){ element[0].blur(); });

      input.on('blur', function() {
        scope.$apply(function() {
          scope.AcfiData.decideToStart(scope.acAnimate);
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

      // looks like I can only watch a ngModel or expression
      scope.$watch(function(){ return scope.AcfiData.string; }, function (value) {
        if(scope.AcfiData.watching === true){
          if(scope.filterTextTimeout){ $timeout.cancel(scope.filterTextTimeout); }
          scope.filterTextTimeout = $timeout(function() {
            scope.AcfiData.checkFontThreshold();
            $rootScope.$broadcast("onQuerySuggestions", value, scope.acId);
          }, 140);
        }
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
      controller['renderAcfi'+string+'Template'] = transclude;
    }
  };
};

var acfi_input_transclude_directive = function(string){
  return {
    restrict: 'A',
    require: '^acFancyInput',
    link: function(scope, element, a, controller){
      if(controller['renderAcfi'+string+'Template']!==undefined){
        controller['renderAcfi'+string+'Template'](scope, function(dom){
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



// ****************************************************************************************************************** //

// *********************************************** Writer Manager *************************************************** //

// Utility service for the input field

acfi.factory('acfiCaret', function () {

  var acfiCaret = {};
  acfiCaret.direction = -1;
  acfiCaret.lastOffset = 0;

  acfiCaret.charDir = {
    lastDir : null,
    check : function(s){
      var ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
          rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
          ltrDirCheck = new RegExp('^[^'+rtlChars+']*['+ltrChars+']'),
          rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');

      var dir = rtlDirCheck.test(s) ? 'rtl' : (ltrDirCheck.test(s) ? 'ltr' : '');
      if( dir ){ this.lastDir = dir; }
      return dir;
    }
  };


  acfiCaret.setDirection = function(e){
    var d = 0;
    if( e.keyCode === 37 ){ d = -1; }
    if( e.keyCode === 39 ){ d = 1; }
    if(e.type === 'mousedown'){ acfiCaret.lastOffset = e.clientX; }
    if(e.type === 'mouseup'){ d = e.clientX < acfiCaret.lastOffset ? -1 : 1; }
    acfiCaret.direction = d;
  };


  acfiCaret.setCaret = function(element, up, e){
    acfiCaret.setDirection(e);
    var pos = acfiCaret.getCaretPosition(element);
    if( acfiCaret.charDir.lastDir === 'rtl' ){
      pos = element.value.length - pos; // BIDI support
    }
    if(up === true){
      return pos;
    } else {
      return pos + acfiCaret.direction;
    }
  };


  acfiCaret.getCaretPosition = function(element){
    var caretPos, direction = acfiCaret.direction || 1;
    if( element.selectionStart || element.selectionStart === '0' ){
      caretPos = direction === -1 ? element.selectionStart : element.selectionEnd;
    }
    return caretPos || 0;
  };

  return acfiCaret;
});


// *************************************************************************************************************** //

// ************************************************* acfi-data *************************************************** //

// data handler for fancy input

//acfi.factory('acfiData', [ '$timeout','$rootScope', 'acfiInterval', function($timeout, $rootScope, AcfiInterval){
//
//  var acfiData = {};
//
//
//  acfiData.data_before = [];
//  acfiData.data_after = [];
//  acfiData.string = '';
//  acfiData.tmp_str = '';
//  acfiData.animating = true;
//  acfiData.colored_text = true;
//  acfiData.watching = false;
//  acfiData.font_style = { 'font-size': "2.70em" };
//  acfiData.font_thresholds = [ [2000, 1.75], [50, 2.05], [45, 2.3], [40, 2.55], [35, 2.70] ];
//  acfiData.noResultDisplay = false;
//  acfiData.suggestionLimit = 2;
//  acfiData.suggestionDisplayLimit = 6;
//  acfiData.selected_index = 10000;
//  acfiData.display = false;
//  acfiData.lock_display = false;
//  acfiData.suggestion_types = [ { "klass": '', "contents": [], "name": '' } ];
//  acfiData.actionTimeout = {};
//  acfiData.init_string = '';
//  acfiData.selected = {};
//  acfiData.resizeAnimation = false;
//
//
//  acfiData.initText = function(_Init,_Pause,_Continue){
//    acfiData.init_string = _Init;
//    acfiData.init_array = _Init.split('').reverse();
//    acfiData.pause_array = _Pause.split('').reverse();
//    acfiData.continue_array = _Continue;
//    AcfiInterval.maxLoopIndex = _Continue.length;
//  };
//
//
//  acfiData.reset = function(){
//    acfiData.colored_text = true;
//    acfiData.animating = true;
//    acfiData.init_array = acfiData.init_string.split('').reverse();
//  };
//
//
//  acfiData.checkFontThreshold = function(){
//    var font_style = {};
//    for(var i = 0; i < acfiData.font_thresholds.length; i++){
//      if(acfiData.data_before.length + acfiData.data_after.length < acfiData.font_thresholds[i][0]){
//        font_style = { 'font-size': (acfiData.font_thresholds[i][1] + "em") };
//      }
//    }
//
//    acfiData.font_style = angular.copy(font_style);
//  };
//
//
//  acfiData.init = function(){
//    if(acfiData.init_array.length > 0){
//      var s = acfiData.init_array.pop();
//      acfiData.data_before.push(acfiData.fillChar(s));
//      if(acfiData.resizeAnimation===true){ acfiData.checkFontThreshold(); }
//    }else{
//      if(AcfiInterval.inFocus === true){
//        AcfiInterval.pauseAnimationInterval();
//      }
//    }
//  };
//
//
//  acfiData.pause = function(loopIndex){
//    acfiData.data_before = [];
//    acfiData.colored_text = true;
//    for(var i = acfiData.pause_array.length - 1; i >= 0; i--) {
//      acfiData.data_before.push(acfiData.fillChar(acfiData.pause_array[i]));
//    }
//    acfiData.colored_text = false;
//    acfiData.tmp_str = acfiData.continue_array[loopIndex].split("").reverse();
//  };
//
//
//  acfiData.continueC = function(){
//    if(acfiData.tmp_str.length > 0 ){
//      var s = acfiData.tmp_str.pop();
//      acfiData.data_before.push(acfiData.fillChar(s));
//      if(acfiData.resizeAnimation===true){ acfiData.checkFontThreshold(); }
//    }else{
//      AcfiInterval.pauseAnimationInterval();
//    }
//  };
//
//
//  acfiData.fillChar = function(s){
//    if(s === "+") {
//      acfiData.colored_text = false;
//      return [];
//    } else if(s === "-"){
//      acfiData.colored_text = true;
//      return [];
//    }else{
//      return [ acfiData.colored_text, acfiData.purifyChar(s) ];
//    }
//  };
//
//
//  acfiData.purifyChar = function(s){
//    if(s === " "){
//      return "\u00A0";
//    } else {
//      return s;
//    }
//  };
//
//
//  acfiData.onKeyUpAndDown = function(event, direction){
//    acfiData.selected_index += direction;
//    if(acfiData.selected_index < 0){
//      acfiData.selected_index = acfiData.displayedLength() - 1;
//    }else if(acfiData.selected_index > acfiData.displayedLength() - 1){
//      acfiData.selected_index = 0;
//    }
//    acfiData.selectContent();
//  };
//
//
//  acfiData.displayedLength = function(){
//    var length = 0;
//    for(var i = 0; i < acfiData.suggestion_types.length; i++){
//      length+=acfiData.suggestion_types[i].contents.length;
//    }
//    return length;
//  };
//
//
//  acfiData.selectSuggestion = function(i1, i2){
//    acfiData.deselectAll();
//    acfiData.selectWithIndexes(i1, i2);
//    acfiData.updateSelectedData(acfiData.suggestion_types[i1].contents[i2]);
//  };
//
//
//  acfiData.selectWithIndexes = function(i1, i2){
//    acfiData.suggestion_types[i1].contents[i2].selected = true;
//    acfiData.selected_index = acfiData.flattenIndex(i1, i2);
//    acfiData.selected =    acfiData.suggestion_types[i1].contents[i2];
//  };
//
//
//  acfiData.selectContent = function(){
//    acfiData.deselectAll();
//    var current_index = 0;
//
//    select_loop:
//    for(var i = 0; i < acfiData.suggestion_types.length; i++){
//      for(var j = 0; j < acfiData.suggestion_types[i].contents.length; j++){
//        if(current_index === acfiData.selected_index){
//          acfiData.selectSuggestion(i, j);
//          break select_loop;
//        }
//        current_index += 1;
//      }
//    }
//  };
//
//
//  acfiData.updateSelectedData = function(selected){
//    var cloned_selected = angular.copy(selected);
//    cloned_selected.string = acfiData.truncate(cloned_selected.string, 70);
//    acfiData.watching = false;
//    acfiData.colored_text = false;
//    acfiData.slug =  cloned_selected.slug;
//    acfiData.type = cloned_selected.type;
//    acfiData.updateInput(cloned_selected.string);
//    acfiData.checkFontThreshold();
//  };
//
//  acfiData.updateInput = function(string){
//    acfiData.string = string;
//    acfiData.data_before = [ acfiData.fillChar(string) ];
//    acfiData.data_after = [];
//  };
//
//
//  acfiData.flattenIndex = function(i1, i2){
//    var count = i2;
//    for(var i = 0; i < i1; i++){
//      count += acfiData.suggestion_types[i].contents.length;
//    }
//    return count;
//  };
//
//
//  acfiData.deselectAll = function(){
//    acfiData.slug = '';
//    for(var i = 0; i < acfiData.suggestion_types.length; i++){
//      for(var j = 0; j < acfiData.suggestion_types[i].contents.length; j++){
//        acfiData.suggestion_types[i].contents[j].selected = false;
//      }
//    }
//  };
//
//
//  acfiData.truncate = function(string, limit){
//    if(string.length > limit){
//      return string.substr(0, limit - 4) + "...";
//    }
//    else{ return string; }
//  };
//
//
//  acfiData.decideToStop = function(){
//    if(acfiData.actionTimeout){
//      $timeout.cancel(acfiData.actionTimeout);
//      acfiData.actionTimeout = {};
//    }
//    if(acfiData.animating === true){
//      acfiData.animating = false;
//      console.log("stopping animation interval");
//      AcfiInterval.stopAnimationInterval();
//    }
//  };
//
//
//  acfiData.decideToStart = function(extra_condition){
//    if(extra_condition === undefined){ extra_condition = true; }
//    $rootScope.hideCaret = false;
//    if(acfiData.animating === false && acfiData.string === "" && extra_condition){
//      acfiData.actionTimeout = $timeout(function(){
//        acfiData.reset();
//        $rootScope.$broadcast("onResetInterval");
//        AcfiInterval.startAnimationInterval();
//      }, 150);
//    }
//  };
//
//  acfiData.processBinding = function(input_str,pos,value){
//    if(acfiData.watching === false){
//      acfiData.watching = true;
//    }else{
//      var tmp_chars = "";
//      for(var i = 0; i < pos; i++){
//        var s = input_str.pop();
//        if (s !== undefined){ tmp_chars += s; }
//      }
//      input_str = input_str.reverse();
//      acfiData.data_after = [input_str.join("")];
//      acfiData.data_before = [[ false, tmp_chars ]];
//      acfiData.slug = '';
//      acfiData.string = value;
//    }
//  };
//
//
//  return acfiData;
//}]);
//


acfi.factory('acfiData', [ '$timeout','$rootScope', 'acfiIntervalInstance', function($timeout, $rootScope, AcfiIntervalInstance){

  var acfiData = function(opts){

    this.id = opts.id;
    this.data_before = [];
    this.data_after = [];
    this.string = '';
    this.tmp_str = '';
    this.animating = true;
    this.colored_text = true;
    this.watching = false;
    this.font_style = { 'font-size': "2.70em" };
    this.font_thresholds = [ [2000, 1.75], [50, 2.05], [45, 2.3], [40, 2.55], [35, 2.70] ];
    this.noResultDisplay = false;
    this.suggestionLimit = 2;
    this.suggestionDisplayLimit = 6;
    this.selected_index = 10000;
    this.display = false;
    this.lock_display = false;
    this.suggestion_types = [ { "klass": '', "contents": [], "name": '' } ];
    this.actionTimeout = {};
    this.init_string = '';
    this.selected = {};
    this.resizeAnimation = false;
    this.acfiInterval = AcfiIntervalInstance.create(opts.id);
  };


  var initText = function(_Init,_Pause,_Continue){
    console.log(this);
    this.init_string = _Init;
    this.init_array = _Init.split('').reverse();
    this.pause_array = _Pause.split('').reverse();
    this.continue_array = _Continue;
    this.acfiInterval.maxLoopIndex = _Continue.length;
  };


  var reset = function(){
    this.colored_text = true;
    this.animating = true;
    this.init_array = this.init_string.split('').reverse();
  };


  var checkFontThreshold = function(){
    var font_style = {};
    for(var i = 0; i < this.font_thresholds.length; i++){
      if(this.data_before.length + this.data_after.length < this.font_thresholds[i][0]){
        font_style = { 'font-size': (this.font_thresholds[i][1] + "em") };
      }
    }

    this.font_style = angular.copy(font_style);
  };


  var init = function(){
    if(this.init_array.length > 0){
      var s = this.init_array.pop();
      this.data_before.push(this.fillChar(s));
      if(this.resizeAnimation===true){ this.checkFontThreshold(); }
    }else{
      if(this.acfiInterval.inFocus === true){
        this.acfiInterval.pauseAnimationInterval();
      }
    }
  };


  var pause = function(loopIndex){
    this.data_before = [];
    this.colored_text = true;
    for(var i = this.pause_array.length - 1; i >= 0; i--) {
      this.data_before.push(this.fillChar(this.pause_array[i]));
    }
    this.colored_text = false;
    this.tmp_str = this.continue_array[loopIndex].split("").reverse();
  };


  var continueC = function(){
    if(this.tmp_str.length > 0 ){
      var s = this.tmp_str.pop();
      this.data_before.push(this.fillChar(s));
      if(this.resizeAnimation===true){ this.checkFontThreshold(); }
    }else{
      this.acfiInterval.pauseAnimationInterval();
    }
  };


  var fillChar = function(s){
    if(s === "+") {
      this.colored_text = false;
      return [];
    } else if(s === "-"){
      this.colored_text = true;
      return [];
    }else{
      return [ this.colored_text, this.purifyChar(s) ];
    }
  };


  var purifyChar = function(s){
    if(s === " "){
      return "\u00A0";
    } else {
      return s;
    }
  };


  var onKeyUpAndDown = function(event, direction){
    this.selected_index += direction;
    if(this.selected_index < 0){
      this.selected_index = this.displayedLength() - 1;
    }else if(this.selected_index > this.displayedLength() - 1){
      this.selected_index = 0;
    }
    this.selectContent();
  };


  var displayedLength = function(){
    var length = 0;
    for(var i = 0; i < this.suggestion_types.length; i++){
      length+= this.suggestion_types[i].contents.length;
    }
    return length;
  };


  var selectSuggestion = function(i1, i2){
    this.deselectAll();
    this.selectWithIndexes(i1, i2);
    this.updateSelectedData(this.suggestion_types[i1].contents[i2]);
  };


  var selectWithIndexes = function(i1, i2){
    this.suggestion_types[i1].contents[i2].selected = true;
    this.selected_index = this.flattenIndex(i1, i2);
    this.selected = this.suggestion_types[i1].contents[i2];
  };


  var selectContent = function(){
    this.deselectAll();
    var current_index = 0;

    select_loop:
    for(var i = 0; i < this.suggestion_types.length; i++){
      for(var j = 0; j < this.suggestion_types[i].contents.length; j++){
        if(current_index === this.selected_index){
          this.selectSuggestion(i, j);
          break select_loop;
        }
        current_index += 1;
      }
    }
  };


  var updateSelectedData = function(selected){
    var cloned_selected = angular.copy(selected);
    cloned_selected.string = this.truncate(cloned_selected.string, 70);
    this.watching = false;
    this.colored_text = false;
    this.slug =  cloned_selected.slug;
    this.type = cloned_selected.type;
    this.updateInput(cloned_selected.string);
    this.checkFontThreshold();
  };

  var updateInput = function(string){
    this.string = string;
    this.data_before = [ this.fillChar(string) ];
    this.data_after = [];
  };


  var flattenIndex = function(i1, i2){
    var count = i2;
    for(var i = 0; i < i1; i++){
      count += this.suggestion_types[i].contents.length;
    }
    return count;
  };


  var deselectAll = function(){
    var slug = '';
    for(var i = 0; i < this.suggestion_types.length; i++){
      for(var j = 0; j < this.suggestion_types[i].contents.length; j++){
        this.suggestion_types[i].contents[j].selected = false;
      }
    }
  };


  var truncate = function(string, limit){
    if(string.length > limit){
      return string.substr(0, limit - 4) + "...";
    }
    else{ return string; }
  };


  var decideToStop = function(){
    if(this.actionTimeout){
      $timeout.cancel(this.actionTimeout);
      this.actionTimeout = {};
    }
    if(this.animating === true){
      this.animating = false;
      this.acfiInterval.stopAnimationInterval();
    }
  };


  var decideToStart = function(extra_condition){
    if(extra_condition === undefined){ extra_condition = true; }
    $rootScope.hideCaret = false;
    if(this.animating === false && this.string === "" && extra_condition){
      var data =this;
      this.actionTimeout = $timeout(function(){
        data.reset();
        $rootScope.$broadcast("onResetInterval", data.id);
        data.acfiInterval.startAnimationInterval();
      }, 150);
    }
  };

  var processBinding = function(input_str, pos, value){
    if(this.watching === false){
      this.watching = true;
    }else{
      var tmp_chars = "";
      for(var i = 0; i < pos; i++){
        var s = input_str.pop();
        if (s !== undefined){ tmp_chars += s; }
      }
      input_str = input_str.reverse();
      this.data_after = [input_str.join("")];
      this.data_before = [[ false, tmp_chars ]];
      this.slug = '';
      this.string = value;
    }
  };

  acfiData.prototype = {
    initText: initText,
    reset: reset,
    checkFontThreshold: checkFontThreshold,
    init: init,
    pause: pause,
    continueC: continueC,
    fillChar: fillChar,
    purifyChar: purifyChar,
    onKeyUpAndDown: onKeyUpAndDown,
    displayedLength: displayedLength,
    selectSuggestion: selectSuggestion,
    selectWithIndexes: selectWithIndexes,
    selectContent: selectContent,
    updateSelectedData: updateSelectedData,
    updateInput: updateInput,
    flattenIndex: flattenIndex,
    deselectAll: deselectAll,
    truncate: truncate,
    decideToStop: decideToStop,
    decideToStart: decideToStart,
    processBinding: processBinding
  };


  return acfiData;
}]);

acfi.factory('acfiDataInstance', [ 'acfiData', function(acfiData){

  var acfiDataInstance = { data: {} };

  acfiDataInstance.create = function(id){
    if(acfiDataInstance.data[id] === undefined){
      acfiDataInstance.data[id] = new acfiData({id:id});
    }else{
      console.log('Error: acfiData Instance already exists with the id: '+id);
    }
    return acfiDataInstance.data[id];
  };

  acfiDataInstance.get = function(id){
    if(acfiDataInstance.data[id] === undefined){
      acfiDataInstance.data[id] = new acfiData({id:id});
    }
    return acfiDataInstance.data[id];
  };

  return acfiDataInstance;
}]);

// ********************************************************************************************************************* //

// ********************************************* acfi-interval ********************************************************* //

// manages text animation in the input field

//acfi.factory('acfiInterval', [ '$q', '$rootScope', '$interval', '$timeout', function ($q, $rootScope, $interval, $timeout) {
//
//  var acfiInterval = {};
//
//  acfiInterval.intervalTime = 90;
//  acfiInterval.pauseTimeoutTime = 2000;
//  acfiInterval.stopInterval = false;
//  acfiInterval.initInterval = null;
//  acfiInterval.pauseTimeout = null;
//  acfiInterval.continueInterval = null;
//  acfiInterval.loopIndex = 0;
//  acfiInterval.maxLoopIndex= 6;
//  acfiInterval.miniTimeout = null;
//  acfiInterval.inFocus = true;
//  acfiInterval.antiKonami = false;
//
//  acfiInterval.startAnimationInterval = function () {
//    if(acfiInterval.antiKonami === false){
//      acfiInterval.pauseTimeout = null;
//      acfiInterval.continueInterval = null;
//
//      acfiInterval.initInterval = $interval(function () {
//        if(acfiInterval.inFocus === true){
//          // only refresh state if in focus
//          $rootScope.$broadcast("onInitInterval");
//        }
//      }, acfiInterval.intervalTime);
//      acfiInterval.antiKonami = true;
//    }
//  };
//
//
//  acfiInterval.stopAnimationInterval = function () {
//    acfiInterval.antiKonami = false;
//    acfiInterval.loopIndex = 0;
//    acfiInterval.safeCancel(acfiInterval.initInterval);
//    acfiInterval.safeTimeoutCancel(acfiInterval.pauseTimeout);
//    acfiInterval.safeTimeoutCancel(acfiInterval.miniTimeout);
//    acfiInterval.safeCancel(acfiInterval.continueInterval);
//    acfiInterval.initInterval = null;
//    acfiInterval.continueInterval = null;
//    acfiInterval.pauseTimeout = null;
//    acfiInterval.stopInterval = true;
//    $rootScope.$broadcast("onStopInterval");
//  };
//
//
//  acfiInterval.continueAnimationInterval = function(){
//    acfiInterval.pauseTimeout = null;
//    acfiInterval.miniTimeout = $timeout(function () {
//      if(acfiInterval.inFocus === true){
//        $rootScope.$broadcast("onSlowContinueInterval");
//      }
//      acfiInterval.continueInterval = $interval(function () {
//        if(acfiInterval.inFocus === true){
//          $rootScope.$broadcast("onContinueInterval");
//        }
//      }, acfiInterval.intervalTime);
//    }, 120);
//  };
//
//
//  acfiInterval.pauseAnimationInterval = function (){
//
//    acfiInterval.safeCancel(acfiInterval.continueInterval);
//    acfiInterval.safeCancel(acfiInterval.initInterval);
//    acfiInterval.initInterval = null;
//    acfiInterval.continueInterval = null;
//
//    acfiInterval.pauseTimeout = $timeout(function () {
//      if(acfiInterval.inFocus === true){
//        acfiInterval.loopIndex += 1;
//        if(acfiInterval.loopIndex >= acfiInterval.maxLoopIndex){
//          acfiInterval.loopIndex = 0;
//        }
//        $rootScope.$broadcast("onPauseInterval", acfiInterval.loopIndex);
//        acfiInterval.continueAnimationInterval();
//      }else{
//        // Important condition: retry after the timeout if no focus
//        // main reason of glitch
//        acfiInterval.pauseAnimationInterval();
//      }
//
//    }, acfiInterval.pauseTimeoutTime);
//
//  };
//
//
//  acfiInterval.safeCancel = function(interval){
//    if(interval !== null){ $interval.cancel(interval); }
//  };
//
//
//  acfiInterval.safeTimeoutCancel = function(timeout){
//    if(timeout !== null){ $timeout.cancel(timeout); }
//  };
//
//  return acfiInterval;
//}]);

acfi.factory('acfiInterval', [ '$q', '$rootScope', '$interval', '$timeout', function ($q, $rootScope, $interval, $timeout) {

  var acfiInterval = function(id){
    this.id = id;
    this.intervalTime = 90;
    this.pauseTimeoutTime = 2000;
    this.stopInterval = false;
    this.initInterval = null;
    this.pauseTimeout = null;
    this.continueInterval = null;
    this.loopIndex = 0;
    this.maxLoopIndex= 6;
    this.miniTimeout = null;
    this.inFocus = true;
    this.antiKonami = false;
  };



  var startAnimationInterval = function () {
    var acfi_i = this;
    if(this.antiKonami === false){
      this.pauseTimeout = null;
      this.continueInterval = null;

      this.initInterval = $interval(function () {
        if(acfi_i.inFocus === true){
          // only refresh state if in focus
          $rootScope.$broadcast("onInitInterval", acfi_i.id);
        }
      }, this.intervalTime);
      this.antiKonami = true;
    }
  };


  var stopAnimationInterval = function () {
    this.antiKonami = false;
    this.loopIndex = 0;
    this.safeCancel(this.initInterval);
    this.safeTimeoutCancel(this.pauseTimeout);
    this.safeTimeoutCancel(this.miniTimeout);
    this.safeCancel(acfiInterval.continueInterval);
    this.initInterval = null;
    this.continueInterval = null;
    this.pauseTimeout = null;
    this.stopInterval = true;
    $rootScope.$broadcast("onStopInterval", this.id);
  };


  var continueAnimationInterval = function(){
    var acfi_i = this;
    this.pauseTimeout = null;
    this.miniTimeout = $timeout(function () {
      if(acfi_i.inFocus === true){
        $rootScope.$broadcast("onSlowContinueInterval", acfi_i.id);
      }
      acfi_i.continueInterval = $interval(function () {
        if(acfi_i.inFocus === true){
          $rootScope.$broadcast("onContinueInterval", acfi_i.id);
        }
      }, acfi_i.intervalTime);
    }, 120);
  };


  var pauseAnimationInterval = function (){
    var acfi_i = this;
    this.safeCancel(this.continueInterval);
    this.safeCancel(this.initInterval);
    this.initInterval = null;
    this.continueInterval = null;

    this.pauseTimeout = $timeout(function () {
      if(acfi_i.inFocus === true){
        acfi_i.loopIndex += 1;
        if(acfi_i.loopIndex >= acfi_i.maxLoopIndex){
          acfi_i.loopIndex = 0;
        }
        $rootScope.$broadcast("onPauseInterval", acfi_i.loopIndex, acfi_i.id);
        acfi_i.continueAnimationInterval();
      }else{
        // Important condition: retry after the timeout if no focus
        // main reason of glitch
        acfi_i.pauseAnimationInterval();
      }

    }, this.pauseTimeoutTime);

  };


  var safeCancel = function(interval){
    if(interval !== null){ $interval.cancel(interval); }
  };


  var safeTimeoutCancel = function(timeout){
    if(timeout !== null){ $timeout.cancel(timeout); }
  };



  acfiInterval.prototype = {
    startAnimationInterval: startAnimationInterval,
    stopAnimationInterval: stopAnimationInterval,
    continueAnimationInterval: continueAnimationInterval,
    pauseAnimationInterval: pauseAnimationInterval,
    safeCancel: safeCancel,
    safeTimeoutCancel: safeTimeoutCancel
  };

  return acfiInterval;
}]);


acfi.factory('acfiIntervalInstance', [ "acfiInterval", function(acfiInterval){

  var acfiIntervalInstance = { data: {} };

  acfiIntervalInstance.create = function(id){
    if(acfiIntervalInstance.data[id]===undefined){
      acfiIntervalInstance.data[id] = new acfiInterval(id);
    }else{
      console.log('Error: acfiInterval Instance already exists with the id: '+id);
    }
    return acfiIntervalInstance.data[id];
  };

  acfiIntervalInstance.get = function(id){
    return acfiIntervalInstance.data[id];
  };

  return acfiIntervalInstance;

}]);})(window, document);