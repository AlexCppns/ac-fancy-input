
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
  searchBoxData.raw_suggestions = [];
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

