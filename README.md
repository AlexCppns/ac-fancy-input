# ac-fancy-input

Fancy input module for angularJS.
Inspired from Jquery library: https://github.com/yairEO/fancyInput

## Demo:

Currently available on http://AlexCppns.github.io

## Features

- Animated placeholder typing.
- Text with mixed colors inside input.
- Custom nested suggestions with template support.

## Basic Usage

For now see the example folder

## Dependencies

This requires angular version 1.2.9, later versions were not tested and earlier version will likely not work.

## Directives

The main directive is:

    <div ac-fancy-input="1" ac-animate="true"></div>

where `ac-animate` controls if the input is animated or not, `1` is a mandatory unique identifier of the input.

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

`acfiInterval` is the input animation service, it is instantiated via the service `acfiIntervalInstance`. The following methods are used to start and stop the animation:

- `startAnimationInterval()`: Starts the animation, not called by default.
- `stopAnimationInterval()`: Stops the animation and resets it.

`acfiData` contains most of the relevant data and methods used in this module. Instances of that service can be obtained via the service `acfiDataInstance`.


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


## To Do List

- Increase test coverage.
- Improve the demo.
- `$broadcast` can become expensive => investigate better ways of handling actions.
- Surface more configuration.
- Use `$templateCache` for directives.

## Contribute

- For questions/bug reports/suggestions, [open a ticket](https://github.com/AlexCppns/ac-fancy-input/issues/new)
- Fork it!
- Do a pull request.
