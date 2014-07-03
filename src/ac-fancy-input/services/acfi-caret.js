
// ****************************************************************************************************************** //

// *********************************************** Writer Manager *************************************************** //

// Utility service for the input field

acfi.factory('acfiCaret', function () {

  var acfiCaret = {};
  acfiCaret.direction = -1;
  acfiCaret.lastOffset = 0;

  acfiCaret.charDir = {
    lastDir : null,
    check : function(s){
      var ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
          rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
          ltrDirCheck = new RegExp('^[^'+rtlChars+']*['+ltrChars+']'),
          rtlDirCheck = new RegExp('^[^'+ltrChars+']*['+rtlChars+']');

      var dir = rtlDirCheck.test(s) ? 'rtl' : (ltrDirCheck.test(s) ? 'ltr' : '');
      if( dir ){ this.lastDir = dir; }
      return dir;
    }
  };


  acfiCaret.setDirection = function(e){
    var d = 0;
    if( e.keyCode === 37 ){ d = -1; }
    if( e.keyCode === 39 ){ d = 1; }
    if(e.type === 'mousedown'){ acfiCaret.lastOffset = e.clientX; }
    if(e.type === 'mouseup'){ d = e.clientX < acfiCaret.lastOffset ? -1 : 1; }
    acfiCaret.direction = d;
  };


  acfiCaret.setCaret = function(element, up, e){
    acfiCaret.setDirection(e);
    var pos = acfiCaret.getCaretPosition(element);
    if( acfiCaret.charDir.lastDir === 'rtl' ){
      pos = element.value.length - pos; // BIDI support
    }
    if(up === true){
      return pos;
    } else {
      return pos + acfiCaret.direction;
    }
  };


  acfiCaret.getCaretPosition = function(element){
    var caretPos, direction = acfiCaret.direction || 1;
    if( element.selectionStart || element.selectionStart === '0' ){
      caretPos = direction === -1 ? element.selectionStart : element.selectionEnd;
    }
    return caretPos || 0;
  };

  return acfiCaret;
});

