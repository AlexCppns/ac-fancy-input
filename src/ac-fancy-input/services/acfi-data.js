
// *************************************************************************************************************** //

// ************************************************* acfi-data *************************************************** //

// data handler for fancy input

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
    this.searchFieldIsFocus = false;
    this.acfiInterval = AcfiIntervalInstance.create(opts.id);
  };


  var initText = function(_Init,_Pause,_Continue){
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
    var data = this;
    $rootScope.hideCaret = false;
    console.log(extra_condition);
    console.log(this.string);
    console.log(this.animating);
    if(this.animating === false && this.string === "" && extra_condition){

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
      acfiDataInstance.data[id] = new acfiData({ id:id });
    }else{
      console.log('Error: acfiData Instance already exists with the id: ' + id);
    }
    return acfiDataInstance.data[id];
  };

  acfiDataInstance.get = function(id){
    if(acfiDataInstance.data[id] === undefined){
      acfiDataInstance.data[id] = new acfiData({ id:id });
    }
    return acfiDataInstance.data[id];
  };

  return acfiDataInstance;
}]);
