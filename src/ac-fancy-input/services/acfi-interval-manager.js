
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

