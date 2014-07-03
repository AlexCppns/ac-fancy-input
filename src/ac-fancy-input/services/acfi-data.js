
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


acfi.factory('acfiData', [ '$timeout','$rootScope', 'acfiInterval', function($timeout, $rootScope, AcfiInterval){

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
  };


  var initText = function(_Init,_Pause,_Continue){
    this.init_string = _Init;
    this.init_array = _Init.split('').reverse();
    this.pause_array = _Pause.split('').reverse();
    this.continue_array = _Continue;
    AcfiInterval.maxLoopIndex = _Continue.length;
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
      if(AcfiInterval.inFocus === true){
        AcfiInterval.pauseAnimationInterval();
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
      AcfiInterval.pauseAnimationInterval();
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
      AcfiInterval.stopAnimationInterval();
    }
  };


  var decideToStart = function(extra_condition){
    if(extra_condition === undefined){ extra_condition = true; }
    $rootScope.hideCaret = false;
    if(this.animating === false && this.string === "" && extra_condition){
      this.actionTimeout = $timeout(function(){
        this.reset();
        $rootScope.$broadcast("onResetInterval");
        AcfiInterval.startAnimationInterval();
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
    initText: initText.bind(this),
    reset: reset.bind(this),
    checkFontThreshold: checkFontThreshold.bind(this),
    init: init.bind(this),
    pause: pause.bind(this),
    continueC: continueC.bind(this),
    fillChar: fillChar.bind(this),
    purifyChar: purifyChar.bind(this),
    onKeyUpAndDown: onKeyUpAndDown.bind(this),
    displayedLength: displayedLength.bind(this),
    selectSuggestion: selectSuggestion.bind(this),
    selectWithIndexes: selectWithIndexes.bind(this),
    selectContent: selectContent.bind(this),
    updateSelectedData: updateSelectedData.bind(this),
    updateInput: updateInput.bind(this),
    flattenIndex: flattenIndex.bind(this),
    deselectAll: deselectAll.bind(this),
    truncate: truncate.bind(this),
    decideToStop: decideToStop.bind(this),
    decideToStart: decideToStart.bind(this),
    processBinding: processBinding.bind(this)
  };


  return acfiData;
}]);

acfi.factory('acfiDataInstance', [ 'acfiData', function(acfiData){

  var acfiDataInstance = { data: {} };

  acfiDataInstance.create = function(id){
    if(acfiDataInstance.data[id]===undefined){
    acfiDataInstance.data[id] = new acfiData(id);
    }else{
      console.log('Error: acfiData Instance already exists with the id: '+id);
    }
    return acfiDataInstance.data[id];
  };

  acfiDataInstance.get = function(id){
    return acfiDataInstance.data[id];
  };

  return acfiDataInstance;
}]);
