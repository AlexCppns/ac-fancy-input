describe('acfiCaret', function(){
  beforeEach(function(){
    module('ac-fancy-input');
  });





  describe('setDirection', function(){
    it('returns the correct direction', inject(function(acfiCaret){
      var e = { keyCode: 37, type: '' };
      acfiCaret.setDirection(e);
      expect(acfiCaret.direction).toEqual(-1);
      e = { keyCode: 39, type: '' };
      acfiCaret.setDirection(e);
      expect(acfiCaret.direction).toEqual(1);
      e = { keyCode: 39, type: 'mousedown',clientX: 2 };
      acfiCaret.setDirection(e);
      expect(acfiCaret.lastOffset).toEqual(2);
      e = { keyCode: 39, type: 'mouseup', clientX: 1 };
      acfiCaret.setDirection(e);
      expect(acfiCaret.direction).toEqual(-1);
      e = { keyCode: 39, type: 'mouseup', clientX: 3 };
      acfiCaret.setDirection(e);
      expect(acfiCaret.direction).toEqual(1);
    }));

  });

  describe('setCaret', function(){
    it('', inject(function(){

    }));

  });
});