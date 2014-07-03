
// ********************************************************************************************************************* //

// ********************************************* acfi-interval ********************************************************* //

// manages text animation in the input field

acfi.factory('acfiInterval', [ '$q', '$rootScope', '$interval', '$timeout', function ($q, $rootScope, $interval, $timeout) {

  var acfiInterval = {};

  acfiInterval.intervalTime = 90;
  acfiInterval.pauseTimeoutTime = 2000;
  acfiInterval.stopInterval = false;
  acfiInterval.initInterval = null;
  acfiInterval.pauseTimeout = null;
  acfiInterval.continueInterval = null;
  acfiInterval.loopIndex = 0;
  acfiInterval.maxLoopIndex= 6;
  acfiInterval.miniTimeout = null;
  acfiInterval.inFocus = true;
  acfiInterval.antiKonami = false;

  acfiInterval.startAnimationInterval = function () {
    if(acfiInterval.antiKonami === false){
      acfiInterval.pauseTimeout = null;
      acfiInterval.continueInterval = null;

      acfiInterval.initInterval = $interval(function () {
        if(acfiInterval.inFocus === true){
          // only refresh state if in focus
          $rootScope.$broadcast("onInitInterval");
        }
      }, acfiInterval.intervalTime);
      acfiInterval.antiKonami = true;
    }
  };


  acfiInterval.stopAnimationInterval = function () {
    acfiInterval.antiKonami = false;
    acfiInterval.loopIndex = 0;
    acfiInterval.safeCancel(acfiInterval.initInterval);
    acfiInterval.safeTimeoutCancel(acfiInterval.pauseTimeout);
    acfiInterval.safeTimeoutCancel(acfiInterval.miniTimeout);
    acfiInterval.safeCancel(acfiInterval.continueInterval);
    acfiInterval.initInterval = null;
    acfiInterval.continueInterval = null;
    acfiInterval.pauseTimeout = null;
    acfiInterval.stopInterval = true;
    $rootScope.$broadcast("onStopInterval");
  };


  acfiInterval.continueAnimationInterval = function(){
    acfiInterval.pauseTimeout = null;
    acfiInterval.miniTimeout = $timeout(function () {
      if(acfiInterval.inFocus === true){
        $rootScope.$broadcast("onSlowContinueInterval");
      }
      acfiInterval.continueInterval = $interval(function () {
        if(acfiInterval.inFocus === true){
          $rootScope.$broadcast("onContinueInterval");
        }
      }, acfiInterval.intervalTime);
    }, 120);
  };


  acfiInterval.pauseAnimationInterval = function (){

    acfiInterval.safeCancel(acfiInterval.continueInterval);
    acfiInterval.safeCancel(acfiInterval.initInterval);
    acfiInterval.initInterval = null;
    acfiInterval.continueInterval = null;

    acfiInterval.pauseTimeout = $timeout(function () {
      if(acfiInterval.inFocus === true){
        acfiInterval.loopIndex += 1;
        if(acfiInterval.loopIndex >= acfiInterval.maxLoopIndex){
          acfiInterval.loopIndex = 0;
        }
        $rootScope.$broadcast("onPauseInterval", acfiInterval.loopIndex);
        acfiInterval.continueAnimationInterval();
      }else{
        // Important condition: retry after the timeout if no focus
        // main reason of glitch
        acfiInterval.pauseAnimationInterval();
      }

    }, acfiInterval.pauseTimeoutTime);

  };


  acfiInterval.safeCancel = function(interval){
    if(interval !== null){ $interval.cancel(interval); }
  };


  acfiInterval.safeTimeoutCancel = function(timeout){
    if(timeout !== null){ $timeout.cancel(timeout); }
  };

  return acfiInterval;
}]);

