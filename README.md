# ac-fancy-input

Fancy input module for angularJS.
Inspired from Jquery library: https://github.com/yairEO/fancyInput

## Demo:

Currently available on http://AlexCppns.github.io

## Features

- Animated placeholder typing.
- Text with mixed colors inside input.
- Custom nested suggestions with template support.

## Dependencies

This requires angular version 1.2.9, later versions were not tested and earlier versions will likely not work.

## Getting started

You can install the most up to date version via:

    bower install ac-fancy-input#1.0.1

See the example folder for details on how to use this module. A short description of the features is also given below.

## Directives

The main directive is:

    <div ac-fancy-input="1"></div>

where `1` is a mandatory unique identifier of the input.

List of optional attributes:

- `ac-animate`: You can block the start of the animation at anytime if you bind this to a scope variable.
- `ac-max-length`: Maximum length of the string in the input tag.
- `ac-options`: You can pass all your initialisation options to this attribute. Usually this is done in a controller or service however when you inject the `acfiDataInstance` (see example folder).

List of optional transclusion directives:

- `acfi-before-template`: Can be used to insert content before the input field
- `acfi-after-template`: Can be used to insert content after the input field (eg: a search icon, a submit button etc).

This is used in combination with:

    <div ac-fancy-input-suggestions="1">
      <div acfi-content-template>
        <div>{{content.string}}</div>
      </div>
    </div>

where `acfi-content-template` is the template contained in the `ng-repeat` block of the suggestion box.
`content` is the only object you have access to in that scope, it can be edited via the service `acfiDataInstance` which handle instances of `acfiData`.
`1` should match the identifier of the corresponding input.

List of optional attributes:

- `ac-suggestion-count`: You can bind the total count of matches to your query to the suggestion box, it will display a clickable view more message if you go over the display limit (which is 6 by default).
- `ac-view-more-action`: Bind method called when clicking on view more message.

List of optional transclusion directives:

- `acfi-view-more-template`: displays a clickable message to view more suggestions.
- `acfi-no-results-template`: displays a message when the list of suggestions is empty.

## Available Services

`acfiData` contains most of the relevant data and methods used in this module. Instances of `acfiData` can be obtained via the service `acfiDataInstance`. Typical use in a controller:

    $scope.AcfiData = AcfiDataInstance.init(id, options);

where `id` is the unique identifier of the input and `options` overwrites the following defaults:

    {
      font_style: { 'font-size': "2.70em" },
      font_thresholds:[ [2000, 1.75], [50, 2.05], [45, 2.3], [40, 2.55], [35, 2.70] ],
      suggestion_types: [ { "klass": '', "contents": [], "name": '' } ],
      suggestionDisplayLimit: 6,
      suggestionLimit: 2,
      init_string: '',
      pause_string: '',
      continue_array: '',
      colored_text: true,
      resizeAnimation: false
    }

`acfiInterval` is the input animation service, it is instantiated via the service `acfiIntervalInstance`. The following methods are used to start and stop the animation:

- `startAnimationInterval()`: Starts the animation, not called by default.
- `stopAnimationInterval()`: Stops the animation and resets it.

`acfiIntervalInstance` is used in the same way as `AcfiDataInstance` with a slight difference:

    $scope.AcfiData = AcfiIntervalInstance.init(id, start);

where `start` is a boolean that starts the animation right away if true.


## Broadcast hooks

Actions are currently handled through broadcast events. There are 2 main ones:

### onSubmitQuery

Usage:

    $scope.$on('onSubmitQuery', function(event, id){
      // id is the unique identifier of the fancy-input
      // event triggered when clicking on a suggestion or pressing the enter key
    });

### onQuerySuggestions

Usage:

    $scope.$on("onQuerySuggestions", function (event, query, id) {
      // id is the unique identifier of the fancy-input
      // event triggered when the input field is updated
      // This is where the list of suggestions is updated
    });

## Templates

`$templateCache` is used to handle templates. You can overwrite the default templates via the methods

- `$templateCache.put('templates/acfi/fancy-input.html', myFancyInputTemplate)`
- `$templateCache.put('templates/acfi/suggestions.html', mySuggestionsTemplate)`

The default templates are defined [here](https://github.com/AlexCppns/ac-fancy-input/tree/master/src/ac-fancy-input/services/acfi-templates.js)

## To Do List

- Increase test coverage.
- Improve the demo.
- `$broadcast` can become expensive => investigate better ways of handling actions.


## Contribute

- For questions/bug reports/suggestions, [open an issue](https://github.com/AlexCppns/ac-fancy-input/issues/new)
- Before creating a Pull Request, please [open an issue](https://github.com/AlexCppns/ac-fancy-input/issues/new) describing your changes.
- Forks are welcomed.

## License

The MIT License (MIT)

Copyright (c) 2014 Alexandre Coppens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.