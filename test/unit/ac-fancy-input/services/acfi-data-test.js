describe('acfiData', function(){

  var acfiData;
  var acfiInterval;
  beforeEach(function(){
    module('ac-fancy-input');
    init_string = "HEADER.SEARCH_FOR_THE_RIGHT +HEADER.TRADE.1";
    pause_array = "HEADER.SEARCH_FOR_THE_RIGHT".split('').reverse();
    continue_string = "HEADER.TRADE.2";
    loopIndex = 1;
    evt = {};

    suggestion_types = [ {
        "klass": "professionals",
        "contents": [
          { id: "1", type: "professionals", slug: "plumbers", string: "this is a long name", selected: false },
          { id: "2", type: "professionals", slug: "sink repair", string: "this is a long name", selected: true },
          { id: "3", type: "professionals", slug: "other repairs", string: "this is a long name", selected: false }
        ],
        "name": "Professionals"
    },
      {
        "klass": "categories",
        "contents": [
          { id: "1", type: "category", slug: "plumbers", string: "this is a long name", selected: false },
          { id: "2", type: "category", slug: "sink repair", string: "this is a long name", selected: true },
        ],
        "name": "Categories"
      }
    ];

    selected_category = { slug: "plumbers", type: "category", id: "18", string: "Plumber" };
    selected_task = { slug: "repair-task", type: "task", id: "14", string: "Kitchen repair" };
    category_context = { name: "Plumbing", slug: "plumbers" };
    task_context = { name: "Sink Repairs", id: "123" };
    font_thresholds = [ [2000, 1.75], [50, 2.05], [45, 2.3], [40, 2.55], [35, 2.75] ];


    inject(function($injector) {
      
      rootScope = $injector.get('$rootScope');
      spyOn(rootScope, '$broadcast').andCallThrough();

      acfiData = $injector.get('acfiDataInstance').get(1);
      acfiInterval = $injector.get('acfiIntervalInstance').get(1);
    });
  });


  describe('reset', function(){
    it('should set the variables properly', inject(function(){
      acfiData.init_string = init_string;
      acfiData.reset();
      expect(acfiData.colored_text).toEqual(true);
      expect(acfiData.animating).toEqual(true);
      expect(acfiData.init_array).toEqual(init_string.split('').reverse());
    }));
  });



  describe('init', function(){
    it('should process the data_before properly', inject(function(){
      acfiData.initText(init_string,"",[continue_string]);
      var character = init_string.split('').reverse().pop();
      var data_before = [];
      data_before.push(acfiData.fillChar(character));
      acfiData.init(acfiInterval);
      expect(acfiData.data_before).toEqual(data_before);
      acfiData.init(acfiInterval);
      expect(acfiData.data_before).not.toEqual(data_before);
    }));


    it('should not process data_before if init_array is empty', inject(function(){
      acfiData.init_array = ['t'];
      var data_before = [];
      data_before.push(acfiData.fillChar('t'));
      acfiData.init(acfiInterval);
      expect(acfiData.data_before).toEqual(data_before);
      acfiData.init(acfiInterval);
      expect(acfiData.data_before).toEqual(data_before);
    }));


    it('should call pauseAnimationInterval if in focus', inject(function($timeout){
      acfiData.init_array = [];
      acfiData.inFocus = true;
      acfiData.init(acfiInterval);
      $timeout.flush(acfiInterval.pauseTimeoutTime+1);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onPauseInterval', acfiInterval.loopIndex, 1);
    }));
  });


  describe('checkFontThreshold', function(){
    it('should set the right fonts', inject(function(){
      acfiData.string = new Array(34).join("a");
      acfiData.data_before = acfiData.string.split('');
      acfiData.checkFontThreshold();
      expect(acfiData.font_style['font-size']).toEqual("2.7em");
      acfiData.string = new Array(39).join("a");
      acfiData.data_before = acfiData.string.split('');
      acfiData.checkFontThreshold();
      expect(acfiData.font_style['font-size']).toEqual("2.55em");
    }));

  });

  describe('pause', function(){
    it('should refill the data_before', inject(function(){
      acfiData.data_before = [];
      acfiData.pause_array = pause_array;
      acfiData.continue_array = [init_string,continue_string];
      var data_before = [];
      for(var i = acfiData.pause_array.length - 1; i >= 0; i--) {
        data_before.push(acfiData.fillChar(acfiData.pause_array[i]));
      }
      acfiData.pause(loopIndex);
      expect(acfiData.data_before).toEqual(data_before);
    }));

    it('should set the tmp_str to a the new value', inject(function(){
      acfiData.pause_array = pause_array;
      acfiData.continue_array = [init_string,continue_string];
      acfiData.tmp_str = "Plumber";
      acfiData.pause(loopIndex);
      expect(acfiData.tmp_str).toEqual(continue_string.split("").reverse());
    }));
  });


  describe('continueC', function(){
    it('should update data_before with tmp_str', inject(function(){
      acfiData.tmp_str = "Plumber".split("").reverse();
      var data_before = [];
      var character =  "Plumber".split("").reverse().pop();
      data_before.push(acfiData.fillChar(character));
      acfiData.continueC(acfiInterval);
      expect(acfiData.data_before).toEqual(data_before);
    }));

    it('pauses the animation if tmp_str has no length', inject(function($timeout){
      acfiData.tmp_str = [];
      acfiData.continueC(acfiInterval);
      $timeout.flush(acfiInterval.pauseTimeoutTime + 1);
      expect(rootScope.$broadcast).toHaveBeenCalledWith('onPauseInterval', acfiInterval.loopIndex, 1);
    }));
  });


  describe('fillChar', function(){
    it('should handle the + character', inject(function(){
      acfiData.colored_text = true;
      expect(acfiData.fillChar('+')).toEqual([]);
      expect(acfiData.colored_text).toEqual(false);
    }));

    it('should return an array containing the string', inject(function(){
      acfiData.colored_text = false;
      expect(acfiData.fillChar('a')).toEqual([false, 'a']);
      acfiData.colored_text = true;
      expect(acfiData.fillChar('b')).toEqual([true , 'b']);
    }));
  });


  describe('purifyChar', function(){
    it('should change the space character into a non breakable space', inject(function(){
      expect(acfiData.purifyChar(' ')).toEqual('\u00A0');
      expect(acfiData.purifyChar('b')).toEqual('b');
    }));
  });




  describe('onKeyUpAndDown', function(){
    it('should change the index correctly', inject(function(){
      acfiData.suggestion_types = suggestion_types;
      acfiData.selected_index = 1;
      acfiData.onKeyUpAndDown(evt, +1);
      expect(acfiData.selected_index).toEqual(2);
      acfiData.onKeyUpAndDown(evt, +1);
      expect(acfiData.selected_index).toEqual(3);
      acfiData.onKeyUpAndDown(evt, -1);
      expect(acfiData.selected_index).toEqual(2);
      acfiData.selected_index = 10000;
      acfiData.onKeyUpAndDown(evt, -1);
      expect(acfiData.selected_index).toEqual(0);
      acfiData.selected_index = 10000;
      acfiData.onKeyUpAndDown(evt, +1);
      expect(acfiData.selected_index).toEqual(0);
    }));

    it('should update the selected attribute', inject(function(){
      acfiData.suggestion_types = suggestion_types;
      acfiData.selected_index = 1;
      acfiData.onKeyUpAndDown(evt, +1);
      expect(acfiData.suggestion_types[0].contents[2].selected).toEqual(true);
      expect(acfiData.suggestion_types[0].contents[1].selected).toEqual(false);
      expect(acfiData.suggestion_types[0].contents[0].selected).toEqual(false);
    }));
  });


  describe('displayedLength', function(){
    it('it returns the right length', inject(function(){
      acfiData.suggestion_types = suggestion_types;
      expect(acfiData.displayedLength()).toEqual(5);
    }));
  });


  describe('selectSuggestion', function(){
    it('selects the right suggestion', inject(function(){
      acfiData.suggestion_types = suggestion_types;
      acfiData.selectSuggestion(0, 2);
      expect(acfiData.suggestion_types[0].contents[2].selected).toEqual(true);
      expect(acfiData.suggestion_types[0].contents[1].selected).toEqual(false);
      expect(acfiData.suggestion_types[0].contents[0].selected).toEqual(false);
    }));
  });


  describe('selectWithIndexes', function(){
    it('should return the right index', inject(function(){
      acfiData.suggestion_types = suggestion_types;
      acfiData.selectWithIndexes(1,1);
      expect(acfiData.selected_index).toEqual(4);
    }));
  });


  describe('updateSelectedData', function(){
    it('fills the right fields for category', inject(function(){
      acfiData.updateSelectedData(selected_category);
      expect(acfiData.slug).toEqual(selected_category.slug);
      expect(acfiData.type).toEqual(selected_category.type);
      expect(acfiData.string).toEqual(selected_category.string);
      expect(acfiData.data_before).toEqual([acfiData.fillChar(selected_category.string)]);
    }));

    it('fills the right fields for task', inject(function(){
      acfiData.updateSelectedData(selected_task);
      expect(acfiData.slug).toEqual(selected_task.slug);
      expect(acfiData.type).toEqual(selected_task.type);
      expect(acfiData.string).toEqual(selected_task.string);
      expect(acfiData.data_before).toEqual([acfiData.fillChar(selected_task.string)]);
    }));
  });


  describe('selectContent', function(){
    it('selects a new suggestion', inject(function(){
      acfiData.suggestion_types = suggestion_types;
      acfiData.selected_index = 2;
      acfiData.selectContent();
      expect(acfiData.suggestion_types[0].contents[2].selected).toEqual(true);
      expect(acfiData.suggestion_types[0].contents[1].selected).toEqual(false);
      expect(acfiData.suggestion_types[0].contents[0].selected).toEqual(false);
    }));
  });


  describe('flattenIndex', function(){
    it('flattens the index', inject(function(){
      suggestion_types[1] = suggestion_types[0];
      acfiData.suggestion_types = suggestion_types;
      var index = acfiData.flattenIndex(1, 2);
      expect(index).toEqual(5);
    }));
  });


  describe('deselectAll', function(){
    it('deselects all', inject(function(){
      acfiData.suggestion_types = suggestion_types;
      acfiData.deselectAll();
      expect(acfiData.suggestion_types[0].contents[2].selected).toEqual(false);
      expect(acfiData.suggestion_types[0].contents[1].selected).toEqual(false);
      expect(acfiData.suggestion_types[0].contents[0].selected).toEqual(false);
    }));
  });


  describe('truncate', function(){
    it('truncates the string', inject(function(){
      var string = 'This is a very long string with lots of words in it';
      expect(acfiData.truncate(string,string.length - 10)).toEqual(string.slice(0, string.length - 14) + "...");
    }));
  });
});