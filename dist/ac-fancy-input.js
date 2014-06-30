(function(window, document) {

// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Modules
var acfi = angular.module('ac-fancy-input',[]);

// ****************************************************************************************************************** //

// ******************************** controller definition for search-box-suggestions ******************************** //


acfi.controller('acfiSuggestionsController',[ 'acfi-searchBoxData', '$scope','$q', function(SearchBoxData, $scope, $q){

  $scope.SearchBoxData = SearchBoxData;

  $scope.$on("onKeyUpAndDown", function(event, direction){
    $scope.deferWatching().then(function(success){
      if(success){
        $scope.SearchBoxData.display = true;
        $scope.SearchBoxData.onKeyUpAndDown(event, direction);
      }
    });
  });

  $scope.$on("onCloseDisplay", function(){

    // This apply is important (called from directive):
    $scope.$apply(function(){
      $scope.SearchBoxData.display = false;
    });
  });

  $scope.deferWatching = function(){
    var deferred = $q.defer();
    $scope.SearchBoxData.watching = false;
    deferred.resolve($scope.SearchBoxData.watching === false);
    return deferred.promise;
  };
}]);


// ****************************************************************************************************************** //

// **************************************** fancy input suggestions directives ************************************** //


acfi.directive('acFancyInputSuggestions', [ function(){

  var header_template = '<div ng-transclude></div><span acfi-header></span>';

  var ng_repeat_template = '<div class="type-row clearfix" data-ng-class="suggestion_type.klass" data-ng-class-even="\'even\'" data-ng-class-odd="\'odd\'" data-ng-repeat="suggestion_type in SearchBoxData.suggestion_types">' +
      '<div class="type-name-wrapper" data-ng-show="suggestion_type.contents.length > 0">' +
      '<div class="type-name small semi-bold">{{suggestion_type.name}}</div>' +
      '</div>'+
      '<div class="type-content" data-ng-show="suggestion_type.contents.length > 0">' +
      '<ul>' +
      '<li data-ng-repeat="content in suggestion_type.contents" ' +
      'data-ng-class="{ selected: content.selected}" ' +
      'data-ng-mouseover="SearchBoxData.selectSuggestion($parent.$index, $index)" ' +
      'data-ng-click="SearchBoxData.selectSuggestion($parent.$index, $index); acfiQueryAction()">' +
      '<div class="row-wrapper light clearfix" acfi-content></div>'+
      '</li>' +
      '</ul>' +
      '</div>' +
      '</div>';

  var footer_template = '<div class="view-more">' +
      '<a data-ng-show="SearchBoxData.noResultDisplay == false && SearchBoxData.displayedLength() > SearchBoxData.suggestionDisplayLimit" ' +
      'data-ng-click="acfiViewMoreAction($event)">' +
      '<div acfi-view-more></div>' +
      '</a>' +
      '<a data-ng-show="SearchBoxData.noResultDisplay == true" class="no-results"><div acfi-no-results></div></a>'+
      '</div>';


  var template = '<div id="input-suggestion-box" class="input-suggestion" data-ng-show="SearchBoxData.display == true" acfi-reset-display>';
  template += header_template + ng_repeat_template + footer_template;
  template += '</div>';

  return {
    scope: {
      acfiQueryAction: '=acQueryAction',
      acfiViewMoreAction: '=acViewMoreAction'
    },
    template: template,
    transclude: true,
    controller: 'acfiSuggestionsController'
  };
}]);

// s, e, a, c, t mean scope, element, attrs, controller, transclude

var acfi_template_directive = function(string){
  return {
    transclude: true,
    restrict: 'A',
    require: '^acFancyInputSuggestions',
    link: function(s, e, a, c, t){
      e.remove();
      c['renderAcfi'+string+'Template'] = t;
    }
  };
};

var acfi_transclude_directive = function(string){
  return {
    restrict: 'A',
    require: '^acFancyInputSuggestions',
    link: function(s, e, a, c){
      c['renderAcfi'+string+'Template'](s, function(dom){ e.append(dom); });
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
acfi.directive('acfiViewMore', function(){ return acfi_transclude_directive('ViewMore'); });// ****************************************************************************************************************** //

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
          // to do, extract the extra condition
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


// *************************************************************************************************************** //

// ************************************************* acfi-data *************************************************** //

// data handler for fancy input

acfi.factory('acfi-searchBoxData', [ '$timeout','$rootScope', 'acfi-intervalManager', function($timeout, $rootScope, intervalManager){

  var searchBoxData = {};

  searchBoxData.data_before = [];
  searchBoxData.data_after = [];
  searchBoxData.string = '';
  searchBoxData.tmp_str = '';
  searchBoxData.animating = true;
  searchBoxData.colored_text = true;
  searchBoxData.watching = false;
  searchBoxData.font_style = { 'font-size': "2.75em" };
  searchBoxData.font_thresholds = [ [2000, 1.75], [50, 2.05], [45, 2.3], [40, 2.55], [35, 2.75] ];
  searchBoxData.noResultDisplay = false;
  searchBoxData.suggestionLimit = 2;
  searchBoxData.suggestionDisplayLimit = 6;
  searchBoxData.selected_index = 10000;
  searchBoxData.display = false;
  searchBoxData.lock_display = false;
  searchBoxData.suggestion_types = [ { "klass": '', "contents": [], "name": '' } ];
  searchBoxData.actionTimeout = {};
  searchBoxData.init_string = '';


  searchBoxData.initText = function(_Init,_Pause,_Continue){
    searchBoxData.init_string = _Init;
    searchBoxData.init_array = _Init.split('').reverse();
    searchBoxData.pause_array = _Pause.split('').reverse();
    searchBoxData.continue_array = _Continue;
    intervalManager.maxLoopIndex = _Continue.length;
  };


  searchBoxData.reset = function(){
    searchBoxData.colored_text = true;
    searchBoxData.animating = true;
    searchBoxData.init_array = searchBoxData.init_string.split('').reverse();
  };


  searchBoxData.checkFontThreshold = function(){
    var font_style = {};
    for(var i = 0; i < searchBoxData.font_thresholds.length; i++){
      if(searchBoxData.string.length < searchBoxData.font_thresholds[i][0]){
        font_style = { 'font-size': (searchBoxData.font_thresholds[i][1] + "em") };
      }
    }
    searchBoxData.font_style = angular.copy(font_style);
  };


  searchBoxData.init = function(intervalManager){
    if(searchBoxData.init_array.length > 0){
      var s = searchBoxData.init_array.pop();
      searchBoxData.data_before.push(searchBoxData.fillChar(s));
    }else{
      if(intervalManager.inFocus === true){
        intervalManager.pauseAnimationInterval();
      }
    }
  };


  searchBoxData.pause = function(loopIndex){
    searchBoxData.data_before = [];
    searchBoxData.colored_text = true;
    for(var i = searchBoxData.pause_array.length - 1; i >= 0; i--) {
      searchBoxData.data_before.push(searchBoxData.fillChar(searchBoxData.pause_array[i]));
    }
    searchBoxData.colored_text = false;
    searchBoxData.tmp_str = searchBoxData.continue_array[loopIndex].split("").reverse();
  };


  searchBoxData.continueC = function(intervalManager){
    if(searchBoxData.tmp_str.length > 0 ){
      var s = searchBoxData.tmp_str.pop();
      searchBoxData.data_before.push(searchBoxData.fillChar(s));
    }else{
      intervalManager.pauseAnimationInterval();
    }
  };


  searchBoxData.fillChar = function(s){
    if(s === "+") {
      searchBoxData.colored_text = false;
      return [];
    } else if(s === "-"){
      searchBoxData.colored_text = true;
      return [];
    }else{
      return [ searchBoxData.colored_text, searchBoxData.purifyChar(s) ];
    }
  };


  searchBoxData.purifyChar = function(s){
    if(s === " "){
      return "\u00A0";
    } else {
      return s;
    }
  };


  searchBoxData.onKeyUpAndDown = function(event, direction){
    searchBoxData.selected_index += direction;
    if(searchBoxData.selected_index < 0){
      searchBoxData.selected_index = searchBoxData.displayedLength() - 1;
    }else if(searchBoxData.selected_index > searchBoxData.displayedLength() - 1){
      searchBoxData.selected_index = 0;
    }
    searchBoxData.selectContent();
  };


  searchBoxData.displayedLength = function(){
    var length = 0;
    for(var i = 0; i < searchBoxData.suggestion_types.length; i++){
      length+=searchBoxData.suggestion_types[i].contents.length;
    }
    return length;
  };


  searchBoxData.selectSuggestion = function(i1, i2){
    searchBoxData.deselectAll();
    searchBoxData.selectWithIndexes(i1, i2);
    searchBoxData.updateSelectedData(searchBoxData.suggestion_types[i1].contents[i2]);
  };


  searchBoxData.selectWithIndexes = function(i1, i2){
    searchBoxData.suggestion_types[i1].contents[i2].selected = true;
    searchBoxData.selected_index = searchBoxData.flattenIndex(i1, i2);
  };


  searchBoxData.selectContent = function(){
    searchBoxData.deselectAll();
    var current_index = 0;
    select_loop:
        for(var i = 0; i < searchBoxData.suggestion_types.length; i++){
          for(var j = 0; j < searchBoxData.suggestion_types[i].contents.length; j++){
            if(current_index === searchBoxData.selected_index){
              searchBoxData.selectSuggestion(i, j);
              break select_loop;
            }
            current_index += 1;
          }
        }
  };


  searchBoxData.updateSelectedData = function(selected){
    var cloned_selected = angular.copy(selected);
    cloned_selected.string = searchBoxData.truncate(cloned_selected.string, 70);
    searchBoxData.watching = false;
    searchBoxData.colored_text = false;
    searchBoxData.string = cloned_selected.string;
    searchBoxData.slug =  cloned_selected.slug;
    searchBoxData.type = cloned_selected.type;
    searchBoxData.data_before = [ searchBoxData.fillChar(cloned_selected.string) ];
    searchBoxData.data_after = [];
    searchBoxData.checkFontThreshold();
  };



  searchBoxData.flattenIndex = function(i1, i2){
    var count = i2;
    for(var i = 0; i < i1; i++){
      count += searchBoxData.suggestion_types[i].contents.length;
    }
    return count;
  };


  searchBoxData.deselectAll = function(){
    searchBoxData.slug = '';
    for(var i = 0; i < searchBoxData.suggestion_types.length; i++){
      for(var j = 0; j < searchBoxData.suggestion_types[i].contents.length; j++){
        searchBoxData.suggestion_types[i].contents[j].selected = false;
      }
    }
  };


  searchBoxData.truncate = function(string, limit){
    if(string.length > limit){
      return string.substr(0, limit - 4) + "...";
    }
    else{ return string; }
  };


  searchBoxData.decideToStop = function(){
    if(searchBoxData.actionTimeout){
      $timeout.cancel(searchBoxData.actionTimeout);
      searchBoxData.actionTimeout = {};
    }
    if(searchBoxData.animating === true){
      searchBoxData.animating = false;
      intervalManager.stopAnimationInterval();
    }
  };


  searchBoxData.decideToStart = function(extra_condition){
    if(extra_condition === undefined){ extra_condition = true; }
    $rootScope.hideCaret = false;
    if(searchBoxData.animating === false && searchBoxData.string === "" && extra_condition){
      searchBoxData.actionTimeout = $timeout(function(){
        searchBoxData.reset();
        $rootScope.$broadcast("onResetInterval");
        intervalManager.startAnimationInterval();
      }, 150);
    }
  };

  searchBoxData.processBinding = function(input_str,pos,value){
    if(searchBoxData.watching === false){
      searchBoxData.watching = true;
    }else{
      var tmp_chars = "";
      for(var i = 0; i < pos; i++){
        var s = input_str.pop();
        if (s !== undefined){ tmp_chars += s; }
      }
      input_str = input_str.reverse();
      searchBoxData.data_after = [input_str.join("")];
      searchBoxData.data_before = [[ false, tmp_chars ]];
      searchBoxData.slug = '';
      searchBoxData.string = value;
    }
  };


  return searchBoxData;
}]);


// ********************************************************************************************************************* //

// ********************************************* acfi-interval-manager ************************************************* //

// manages text animation in the input field

acfi.factory('acfi-intervalManager', [ '$q', '$rootScope', '$interval', '$timeout', function ($q, $rootScope, $interval, $timeout) {

  var intervalManager = {};

  intervalManager.intervalTime = 90;
  intervalManager.pauseTimeoutTime = 2000;
  intervalManager.stopInterval = false;
  intervalManager.initInterval = null;
  intervalManager.pauseTimeout = null;
  intervalManager.continueInterval = null;
  intervalManager.loopIndex = 0;
  intervalManager.maxLoopIndex= 6;
  intervalManager.miniTimeout = null;
  intervalManager.inFocus = true;
  intervalManager.antiKonami = false;

  intervalManager.startAnimationInterval = function () {
    if(intervalManager.antiKonami === false){
      intervalManager.pauseTimeout = null;
      intervalManager.continueInterval = null;

      intervalManager.initInterval = $interval(function () {
        if(intervalManager.inFocus === true){
          // only refresh state if in focus
          $rootScope.$broadcast("onInitInterval");
        }
      }, intervalManager.intervalTime);
      intervalManager.antiKonami = true;
    }
  };


  intervalManager.stopAnimationInterval = function () {
    intervalManager.antiKonami = false;
    intervalManager.loopIndex = 0;
    intervalManager.safeCancel(intervalManager.initInterval);
    intervalManager.safeTimeoutCancel(intervalManager.pauseTimeout);
    intervalManager.safeTimeoutCancel(intervalManager.miniTimeout);
    intervalManager.safeCancel(intervalManager.continueInterval);
    intervalManager.initInterval = null;
    intervalManager.continueInterval = null;
    intervalManager.pauseTimeout = null;
    intervalManager.stopInterval = true;
    $rootScope.$broadcast("onStopInterval");
  };


  intervalManager.continueAnimationInterval = function(){
    intervalManager.pauseTimeout = null;
    intervalManager.miniTimeout = $timeout(function () {
      if(intervalManager.inFocus === true){
        $rootScope.$broadcast("onSlowContinueInterval");
      }
      intervalManager.continueInterval = $interval(function () {
        if(intervalManager.inFocus === true){
          $rootScope.$broadcast("onContinueInterval");
        }
      }, intervalManager.intervalTime);
    }, 120);
  };


  intervalManager.pauseAnimationInterval = function (){

    intervalManager.safeCancel(intervalManager.continueInterval);
    intervalManager.safeCancel(intervalManager.initInterval);
    intervalManager.initInterval = null;
    intervalManager.continueInterval = null;

    intervalManager.pauseTimeout = $timeout(function () {
      if(intervalManager.inFocus === true){
        intervalManager.loopIndex += 1;
        if(intervalManager.loopIndex >= intervalManager.maxLoopIndex){
          intervalManager.loopIndex = 0;
        }
        $rootScope.$broadcast("onPauseInterval", intervalManager.loopIndex);
        intervalManager.continueAnimationInterval();
      }else{
        // Important condition: retry after the timeout if no focus
        // main reason of glitch
        intervalManager.pauseAnimationInterval();
      }

    }, intervalManager.pauseTimeoutTime);

  };


  intervalManager.safeCancel = function(interval){
    if(interval !== null){ $interval.cancel(interval); }
  };


  intervalManager.safeTimeoutCancel = function(timeout){
    if(timeout !== null){ $timeout.cancel(timeout); }
  };

  return intervalManager;
}]);


// ****************************************************************************************************************** //

// *********************************************** Writer Manager *************************************************** //

// Utility service for the input field

acfi.factory('acfi-writerManager', function () {

  var writerManager = {};
  writerManager.direction = -1;
  writerManager.lastOffset = 0;

  writerManager.charDir = {
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


  writerManager.setDirection = function(e){
    var d = 0;
    if( e.keyCode === 37 ){ d = -1; }
    if( e.keyCode === 39 ){ d = 1; }
    if(e.type === 'mousedown'){ writerManager.lastOffset = e.clientX; }
    if(e.type === 'mouseup'){ d = e.clientX < writerManager.lastOffset ? -1 : 1; }
    writerManager.direction = d;
  };


  writerManager.setCaret = function(element, up, e){
    writerManager.setDirection(e);
    var pos = writerManager.getCaretPosition(element);
    if( writerManager.charDir.lastDir === 'rtl' ){
      pos = element.value.length - pos; // BIDI support
    }
    if(up === true){
      return pos;
    } else {
      return pos + writerManager.direction;
    }
  };


  writerManager.getCaretPosition = function(element){
    var caretPos, direction = writerManager.direction || 1;
    if( element.selectionStart || element.selectionStart === '0' ){
      caretPos = direction === -1 ? element.selectionStart : element.selectionEnd;
    }
    return caretPos || 0;
  };

  return writerManager;
});

})(window, document);