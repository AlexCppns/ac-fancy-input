# ac-fancy-input

WARNING: Still in Alpha development. This package won't be stable until the limitations are removed and it is fully tested.

Fancy input module for angularJS.
Inspired from Jquery library: https://github.com/yairEO/fancyInput

## Demo:

Currently available on http://AlexCppns.github.io


## Features:

- Animated placeholder typing.
- Text with mixed colors inside input.
- Custom nested suggestions with template support.

## Limitations

The input data object is a singleton for now.
You cannot have multiple instances of the input directive on the same page without having unwanted effects.

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
`content` is the only object you have access to in that scope, it can be edited via the service `acfiData` (now being refactored).
`1` should match the identifier of the corresponding input.

List of optional attributes:

- `ac-suggestion-count`: You can bind the total count of matches to your query to the suggestion box, it will display a clickable view more message if you go over the display limit (which is 6 by default).
- `ac-view-more-action`: Bind method called when clicking on view more message.

List of optional transclusion directives:

- `acfi-view-more-template`: displays a clickable message to view more suggestions.
- `acfi-no-results-template`: displays a message when the list of suggestions is empty.

## Available Services

`acfiInterval` is the input animation service. The following methods are used to start and stop the animation:

- `startAnimationInterval()`: Starts the animation, not called by default.
- `stopAnimationInterval()`: Stops the animation and resets it.

`acfiData` contains most of the relevant data and methods used in this module. It is currently being refactored to allow multiple instances.





