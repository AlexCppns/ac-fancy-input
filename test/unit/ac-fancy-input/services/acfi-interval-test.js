describe('interval services test', function(){

  var rootScope;
  var acfiInterval;
  beforeEach(function(){
    module('ac-fancy-input');
    inject(function($injector) {
      rootScope = $injector.get('$rootScope');
      spyOn(rootScope, '$broadcast').andCallThrough();
      acfiInterval = $injector.get('acfiIntervalInstance').get(1);
    });
  });


  describe('when acfiInterval.startAnimationInterval', function(){

    it('broadcasts every 90ms', inject(function($interval){

      acfiInterval.startAnimationInterval();
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
      $interval.flush(91);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onInitInterval', 1);
    }));
  });


  describe('when acfiInterval.stopAnimationInterval', function(){

    it('stops the init animation', inject(function($interval){

      acfiInterval.startAnimationInterval();
      $interval.flush(20);
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
      acfiInterval.stopAnimationInterval();
      $interval.flush(71);
      expect(rootScope.$broadcast).not.toHaveBeenCalledWith('onInitInterval', 1);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onStopInterval', 1);
    }));


    it('stops the continue animation', inject(function($timeout, $interval){

      acfiInterval.continueAnimationInterval();
      $timeout.flush(100);
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
      acfiInterval.stopAnimationInterval();
      $timeout.flush(100);
      expect(rootScope.$broadcast).not.toHaveBeenCalledWith('onSlowContinueInterval', 1);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onStopInterval', 1);
      $interval.flush(91);
      expect(rootScope.$broadcast).not.toHaveBeenCalledWith('onContinueInterval', 1);
    }));

    it('stops the pause animation', inject(function($timeout){

      acfiInterval.pauseAnimationInterval();
      $timeout.flush(1900);
      acfiInterval.stopAnimationInterval();
      $timeout.flush(102);
      expect(rootScope.$broadcast).not.toHaveBeenCalledWith('onPauseInterval', acfiInterval.loopIndex, 1);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onStopInterval', 1);
    }));
  });


  describe('when acfiInterval.continueAnimationInterval', function(){

    it('broadcasts onSlowContinueInterval with a timeout of 120ms', inject(function($timeout){

      acfiInterval.continueAnimationInterval();
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
      $timeout.flush(121);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onSlowContinueInterval', 1);
    }));

    it('broadcasts onContinueInterval with a timeout of 120ms and an interval of 90ms', inject(function($timeout, $interval){

      acfiInterval.continueAnimationInterval();
      expect(rootScope.$broadcast).not.toHaveBeenCalled();
      $timeout.flush(121);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onSlowContinueInterval', 1);
      $interval.flush(91);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onContinueInterval', 1);
    }));
  });


  describe('when acfiInterval.pauseAnimationInterval', function(){

    it("broadcasts onPauseInterval with a 2000ms delay then resumes continue interval", inject(function($timeout, $interval){

      acfiInterval.pauseAnimationInterval();
      $timeout.flush(2001);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onPauseInterval', acfiInterval.loopIndex, 1);
      $timeout.flush(121);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onSlowContinueInterval', 1);
      $interval.flush(91);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onContinueInterval', 1);
    }));

    it('stops broadcasting when inFocus == false', inject(function($timeout){

      acfiInterval.pauseAnimationInterval();
      $timeout.flush(1901);
      acfiInterval.inFocus = false;
      $timeout.flush(201);
      expect(rootScope.$broadcast).not.toHaveBeenCalledWith('onPauseInterval', acfiInterval.loopIndex, 1);
    }));
  });
});