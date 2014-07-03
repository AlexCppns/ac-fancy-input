
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
    if(this.antiKonami === false){
      this.pauseTimeout = null;
      this.continueInterval = null;

      this.initInterval = $interval(function () {
        if(this.inFocus === true){
          // only refresh state if in focus
          $rootScope.$broadcast("onInitInterval");
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
    $rootScope.$broadcast("onStopInterval");
  };


  var continueAnimationInterval = function(){
    this.pauseTimeout = null;
    this.miniTimeout = $timeout(function () {
      if(this.inFocus === true){
        $rootScope.$broadcast("onSlowContinueInterval");
      }
      this.continueInterval = $interval(function () {
        if(this.inFocus === true){
          $rootScope.$broadcast("onContinueInterval");
        }
      }, this.intervalTime);
    }, 120);
  };


  var pauseAnimationInterval = function (){

    this.safeCancel(this.continueInterval);
    this.safeCancel(this.initInterval);
    this.initInterval = null;
    this.continueInterval = null;

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
