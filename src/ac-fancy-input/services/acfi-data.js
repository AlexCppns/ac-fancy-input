
// *************************************************************************************************************** //

// ************************************************* acfi-data *************************************************** //

// data handler for fancy input

acfi.factory('acfiData', [ '$timeout','$rootScope', 'acfiInterval', function($timeout, $rootScope, AcfiInterval){

  var acfiData = {};

  acfiData.data_before = [];
  acfiData.data_after = [];
  acfiData.string = '';
  acfiData.tmp_str = '';
  acfiData.animating = true;
  acfiData.colored_text = true;
  acfiData.watching = false;
  acfiData.font_style = { 'font-size': "2.75em" };
  acfiData.font_thresholds = [ [2000, 1.75], [50, 2.05], [45, 2.3], [40, 2.55], [35, 2.75] ];
  acfiData.noResultDisplay = false;
  acfiData.suggestionLimit = 2;
  acfiData.suggestionDisplayLimit = 6;
  acfiData.selected_index = 10000;
  acfiData.display = false;
  acfiData.lock_display = false;
  acfiData.suggestion_types = [ { "klass": '', "contents": [], "name": '' } ];
  acfiData.actionTimeout = {};
  acfiData.init_string = '';
  acfiData.selected = {};
  acfiData.resizeAnimation = false;


  acfiData.initText = function(_Init,_Pause,_Continue){
    acfiData.init_string = _Init;
    acfiData.init_array = _Init.split('').reverse();
    acfiData.pause_array = _Pause.split('').reverse();
    acfiData.continue_array = _Continue;
    AcfiInterval.maxLoopIndex = _Continue.length;
  };


  acfiData.reset = function(){
    acfiData.colored_text = true;
    acfiData.animating = true;
    acfiData.init_array = acfiData.init_string.split('').reverse();
  };


  acfiData.checkFontThreshold = function(){
    var font_style = {};
    for(var i = 0; i < acfiData.font_thresholds.length; i++){
      if(acfiData.data_before.length + acfiData.data_after.length < acfiData.font_thresholds[i][0]){
        font_style = { 'font-size': (acfiData.font_thresholds[i][1] + "em") };
      }
    }

    acfiData.font_style = angular.copy(font_style);
  };


  acfiData.init = function(){
    if(acfiData.init_array.length > 0){
      var s = acfiData.init_array.pop();
      acfiData.data_before.push(acfiData.fillChar(s));
      if(acfiData.resizeAnimation===true){ acfiData.checkFontThreshold(); }
    }else{
      if(AcfiInterval.inFocus === true){
        AcfiInterval.pauseAnimationInterval();
      }
    }
  };


  acfiData.pause = function(loopIndex){
    acfiData.data_before = [];
    acfiData.colored_text = true;
    for(var i = acfiData.pause_array.length - 1; i >= 0; i--) {
      acfiData.data_before.push(acfiData.fillChar(acfiData.pause_array[i]));
    }
    acfiData.colored_text = false;
    acfiData.tmp_str = acfiData.continue_array[loopIndex].split("").reverse();
  };


  acfiData.continueC = function(){
    if(acfiData.tmp_str.length > 0 ){
      var s = acfiData.tmp_str.pop();
      acfiData.data_before.push(acfiData.fillChar(s));
      if(acfiData.resizeAnimation===true){ acfiData.checkFontThreshold(); }
    }else{
      AcfiInterval.pauseAnimationInterval();
    }
  };


  acfiData.fillChar = function(s){
    if(s === "+") {
      acfiData.colored_text = false;
      return [];
    } else if(s === "-"){
      acfiData.colored_text = true;
      return [];
    }else{
      return [ acfiData.colored_text, acfiData.purifyChar(s) ];
    }
  };


  acfiData.purifyChar = function(s){
    if(s === " "){
      return "\u00A0";
    } else {
      return s;
    }
  };


  acfiData.onKeyUpAndDown = function(event, direction){
    acfiData.selected_index += direction;
    if(acfiData.selected_index < 0){
      acfiData.selected_index = acfiData.displayedLength() - 1;
    }else if(acfiData.selected_index > acfiData.displayedLength() - 1){
      acfiData.selected_index = 0;
    }
    acfiData.selectContent();
  };


  acfiData.displayedLength = function(){
    var length = 0;
    for(var i = 0; i < acfiData.suggestion_types.length; i++){
      length+=acfiData.suggestion_types[i].contents.length;
    }
    return length;
  };


  acfiData.selectSuggestion = function(i1, i2){
    acfiData.deselectAll();
    acfiData.selectWithIndexes(i1, i2);
    acfiData.updateSelectedData(acfiData.suggestion_types[i1].contents[i2]);
  };


  acfiData.selectWithIndexes = function(i1, i2){
    acfiData.suggestion_types[i1].contents[i2].selected = true;
    acfiData.selected_index = acfiData.flattenIndex(i1, i2);
    acfiData.selected =    acfiData.suggestion_types[i1].contents[i2];
  };


  acfiData.selectContent = function(){
    acfiData.deselectAll();
    var current_index = 0;
    select_loop:
        for(var i = 0; i < acfiData.suggestion_types.length; i++){
          for(var j = 0; j < acfiData.suggestion_types[i].contents.length; j++){
            if(current_index === acfiData.selected_index){
              acfiData.selectSuggestion(i, j);
              break select_loop;
            }
            current_index += 1;
          }
        }
  };


  acfiData.updateSelectedData = function(selected){
    var cloned_selected = angular.copy(selected);
    cloned_selected.string = acfiData.truncate(cloned_selected.string, 70);
    acfiData.watching = false;
    acfiData.colored_text = false;
    acfiData.slug =  cloned_selected.slug;
    acfiData.type = cloned_selected.type;
    acfiData.updateInput(cloned_selected.string);
    acfiData.checkFontThreshold();
  };

  acfiData.updateInput = function(string){
    acfiData.string = string;
    acfiData.data_before = [ acfiData.fillChar(string) ];
    acfiData.data_after = [];
  };


  acfiData.flattenIndex = function(i1, i2){
    var count = i2;
    for(var i = 0; i < i1; i++){
      count += acfiData.suggestion_types[i].contents.length;
    }
    return count;
  };


  acfiData.deselectAll = function(){
    acfiData.slug = '';
    for(var i = 0; i < acfiData.suggestion_types.length; i++){
      for(var j = 0; j < acfiData.suggestion_types[i].contents.length; j++){
        acfiData.suggestion_types[i].contents[j].selected = false;
      }
    }
  };


  acfiData.truncate = function(string, limit){
    if(string.length > limit){
      return string.substr(0, limit - 4) + "...";
    }
    else{ return string; }
  };


  acfiData.decideToStop = function(){
    if(acfiData.actionTimeout){
      $timeout.cancel(acfiData.actionTimeout);
      acfiData.actionTimeout = {};
    }
    if(acfiData.animating === true){
      acfiData.animating = false;
      AcfiInterval.stopAnimationInterval();
    }
  };


  acfiData.decideToStart = function(extra_condition){
    if(extra_condition === undefined){ extra_condition = true; }
    $rootScope.hideCaret = false;
    if(acfiData.animating === false && acfiData.string === "" && extra_condition){
      acfiData.actionTimeout = $timeout(function(){
        acfiData.reset();
        $rootScope.$broadcast("onResetInterval");
        AcfiInterval.startAnimationInterval();
      }, 150);
    }
  };

  acfiData.processBinding = function(input_str,pos,value){
    if(acfiData.watching === false){
      acfiData.watching = true;
    }else{
      var tmp_chars = "";
      for(var i = 0; i < pos; i++){
        var s = input_str.pop();
        if (s !== undefined){ tmp_chars += s; }
      }
      input_str = input_str.reverse();
      acfiData.data_after = [input_str.join("")];
      acfiData.data_before = [[ false, tmp_chars ]];
      acfiData.slug = '';
      acfiData.string = value;
    }
  };


  return acfiData;
}]);

