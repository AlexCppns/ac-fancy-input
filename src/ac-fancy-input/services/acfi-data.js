
// *************************************************************************************************************** //

// ************************************************* acfi-data *************************************************** //

// data handler for fancy input

acfi.factory('acfiData', [ '$timeout','$rootScope', 'acfiIntervalInstance', function($timeout, $rootScope, AcfiIntervalInstance){

  var acfiData = function(id, opts){

    this.id = id;
    this.data_before = [];
    this.data_after = [];
    this.string = '';
    this.tmp_str = '';
    this.animating = true;
    this.watching = false;
    this.noResultDisplay = false;
    this.selected_index = 10000;
    this.display = false;
    this.lock_display = false;
    this.actionTimeout = {};
    this.filterTextTimeout = {};
    this.selected = {};
    this.searchFieldIsFocus = false;

    this.defaults = {
      font_style: { 'font-size': "2.70em" },
      font_thresholds:[ [2000, 1.75], [50, 2.05], [45, 2.3], [40, 2.55], [35, 2.70] ],
      suggestion_types: [ { "klass": '', "contents": [], "name": '' } ],
      suggestionDisplayLimit: 6,
      suggestionLimit: 2,
      init_string: '',
      pause_string: '',
      continue_array: '',
      colored_text: true,
      resizeAnimation: false
    };

    this.setOpts(opts);
    this.acfiInterval = AcfiIntervalInstance.create(id);
    this.initText(this.init_string,this.pause_string,this.continue_array);
  };


  var setOpts = function(opts){
    this.colored_text = opts.colored_text || this.defaults.colored_text;
    this.font_style = opts.font_style || this.defaults.font_style;
    this.font_thresholds = opts.font_thresholds || this.defaults.font_thresholds;
    this.suggestionLimit = opts.suggestionLimit || this.defaults.suggestionLimit;
    this.suggestionDisplayLimit = opts.suggestionDisplayLimit || this.defaults.suggestionDisplayLimit;
    this.suggestion_types = opts.suggestion_types || this.defaults.suggestion_types;
    this.init_string = opts.init_string || this.defaults.init_string;
    this.init_array = opts.init_array || this.defaults.init_array;
    this.continue_array = opts.continue_array || this.defaults.continue_array;
    this.pause_string = opts.pause_string || this.defaults.pause_string;
    this.resizeAnimation = opts.resizeAnimation || this.defaults.resizeAnimation;
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
    var length = this.data_before.length + this.data_after.length;
    if(length<3){ length = this.string.length; }
    for(var i = 0; i < this.font_thresholds.length; i++){

      if( length < this.font_thresholds[i][0]){
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

  var show = function(){
    this.noResultDisplay = (this.displayedLength() === 0);
    this.display = true;
  };

  var hide = function(){
    this.noResultDisplay = false;
    this.display = false;
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

  var setInput = function(string){
    this.updateInput(string);
    this.hide();
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


  var handleWatch = function(value){
    var data = this;
    if(this.watching === true){
      if(this.filterTextTimeout){ $timeout.cancel(this.filterTextTimeout); }
      this.filterTextTimeout = $timeout(function() {
        data.checkFontThreshold();
        $rootScope.$broadcast("onQuerySuggestions", value, data.id);
      }, 250);
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
    setInput: setInput,
    flattenIndex: flattenIndex,
    deselectAll: deselectAll,
    truncate: truncate,
    decideToStop: decideToStop,
    decideToStart: decideToStart,
    processBinding: processBinding,
    handleWatch: handleWatch,
    setOpts: setOpts,
    show: show,
    hide: hide
  };


  return acfiData;
}]);


acfi.factory('acfiDataInstance', [ 'acfiData', function(acfiData){

  var acfiDataInstance = { data: {} };

  acfiDataInstance.create = function(id, opts){
    acfiDataInstance.data[id] = new acfiData(id, opts);
    return acfiDataInstance.data[id];
  };

  acfiDataInstance.init = function(id, opts){
    if(acfiDataInstance.data[id] === undefined){
      acfiDataInstance.create(id, opts);
    }else if(opts !== undefined && opts !== {}){
      acfiDataInstance.data[id].setOpts(opts);
    }
    return acfiDataInstance.data[id];
  };

  return acfiDataInstance;
}]);
