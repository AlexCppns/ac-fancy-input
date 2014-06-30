
// ****************************************************************************************************************** //

// *********************************************** Writer Manager *************************************************** //

// Utility service for the input field

acfi.factory('acfi-writerManager', function () {

  var writerManager = {};
  writerManager.direction = -1;
  writerManager.lastOffset = 0;

  writerManager.charDir = {
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


  writerManager.setDirection = function(e){
    var d = 0;
    if( e.keyCode === 37 ){ d = -1; }
    if( e.keyCode === 39 ){ d = 1; }
    if(e.type === 'mousedown'){ writerManager.lastOffset = e.clientX; }
    if(e.type === 'mouseup'){ d = e.clientX < writerManager.lastOffset ? -1 : 1; }
    writerManager.direction = d;
  };


  writerManager.setCaret = function(element, up, e){
    writerManager.setDirection(e);
    var pos = writerManager.getCaretPosition(element);
    if( writerManager.charDir.lastDir === 'rtl' ){
      pos = element.value.length - pos; // BIDI support
    }
    if(up === true){
      return pos;
    } else {
      return pos + writerManager.direction;
    }
  };


  writerManager.getCaretPosition = function(element){
    var caretPos, direction = writerManager.direction || 1;
    if( element.selectionStart || element.selectionStart === '0' ){
      caretPos = direction === -1 ? element.selectionStart : element.selectionEnd;
    }
    return caretPos || 0;
  };

  return writerManager;
});

