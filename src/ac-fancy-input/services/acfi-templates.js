acfi.factory('acfiTemplates', [ function(){

  var acfiTemplates = {};

  acfiTemplates.getSuggestions = function(){
    var header_template = '<div data-ng-transclude></div><span data-acfi-header></span>';

    var ng_repeat_template = '<div class="type-row clearfix" data-ng-class="suggestion_type.klass" data-ng-class-even="\'even\'" data-ng-class-odd="\'odd\'" data-ng-repeat="suggestion_type in AcfiData.suggestion_types">' +
        '<div class="type-name-wrapper" data-ng-show="suggestion_type.contents.length > 0">' +
        '<div class="type-name small semi-bold">{{suggestion_type.name}}</div>' +
        '</div>'+
        '<div class="type-content" data-ng-show="suggestion_type.contents.length > 0">' +
        '<ul>' +
        '<li data-ng-repeat="content in suggestion_type.contents" ' +
        'data-ng-class="{ selected: content.selected}" ' +
        'data-ng-mouseover="AcfiData.selectSuggestion($parent.$index, $index)" ' +
        'data-ng-click="AcfiData.selectSuggestion($parent.$index, $index); acfiQueryAction()">' +
        '<div class="row-wrapper light clearfix" data-acfi-content></div>'+
        '</li>' +
        '</ul>' +
        '</div>' +
        '</div>';

    var footer_template = '<div class="view-more">' +
        '<a data-ng-show="AcfiData.noResultDisplay == false && acSuggestionCount > AcfiData.suggestionDisplayLimit" ' +
        'data-ng-click="acfiViewMoreAction($event)">' +
        '<div data-acfi-view-more></div>' +
        '</a>' +
        '<a data-ng-show="AcfiData.noResultDisplay == true" class="no-results"><div data-acfi-no-results></div></a>'+
        '</div>';

    var suggestions_template = '<div class="input-suggestion-container"><div id="acfi-suggestions{{acId}}" class="input-suggestion" data-ng-show="AcfiData.display == true" data-acfi-reset-display>';
    suggestions_template += header_template + ng_repeat_template + footer_template;
    suggestions_template += '</div></div>';
    return suggestions_template;
  };


  acfiTemplates.getInput = function(){
    var dummy_transclude = '<div data-ng-transclude></div>';
    var before_template = '<div class="acfi-before" data-acfi-before></div>';
    var after_template = '<span data-acfi-after></span>';

    var input_template = '<input tabindex="{{acId}}" id="acfi{{acId}}" class="anim-field" type="text" maxlength="{{acMaxLength}}" spellcheck="false"' +
        ' data-ng-class="{\'no-opacity\': AcfiData.animating == false}" data-ng-style="AcfiData.font_style"' +
        ' data-ng-model="AcfiData.string">';

    var overlay_template =  '<div data-ng-style="AcfiData.font_style" class="fancyInputFiller">' +
        '<span data-ng-repeat="char in AcfiData.data_before track by $index" data-ng-class="{colored: char[0] == true}">{{char[1]}}</span>' +
        '<b class="caret" data-ng-hide="$root.hideCaret">&#8203;</b>' +
        '<span data-ng-repeat="char_2 in AcfiData.data_after track by $index">{{char_2}}</span>' +
        '</div>';

    var acfi_template = '<div data-ng-class="{ focus: AcfiData.searchFieldIsFocus || AcfiData.display }">';
    acfi_template += dummy_transclude + before_template + input_template + overlay_template + after_template;
    acfi_template += '</div>';
    return acfi_template;
  };


  return acfiTemplates;

}]);
