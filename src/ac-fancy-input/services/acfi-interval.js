
// ********************************************************************************************************************* //

// ********************************************* acfi-interval ********************************************************* //

// manages text animation in the input field

acfi.factory('acfiInterval', [ '$rootScope', '$interval', '$timeout', function ($rootScope, $interval, $timeout) {

  var acfiInterval = function(id){
    this.id = id;
    this.intervalTime = 90;
    this.pauseTimeoutTime = 2000;
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
    this.safeCancel(this.continueInterval);
    this.initInterval = null;
    this.continueInterval = null;
    this.pauseTimeout = null;
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

// this handles instances of the service above.

acfi.factory('acfiIntervalInstance', [ "acfiInterval", function(acfiInterval){

  var acfiIntervalInstance = { data: {} };

  acfiIntervalInstance.create = function(id){
    acfiIntervalInstance.data[id] = new acfiInterval(id);
    return acfiIntervalInstance.data[id];
  };

  acfiIntervalInstance.init = function(id, start){
    if(acfiIntervalInstance.data[id]===undefined){
      acfiIntervalInstance.create(id);
    }

    if(start === true){ acfiIntervalInstance.data[id].startAnimationInterval(); }
    return acfiIntervalInstance.data[id];
  };

  return acfiIntervalInstance;

}]);
