# ac-fancy-input

(WARNING: Still in Alpha development)

Fancy input module for angularJS.
Inspired from Jquery library: https://github.com/yairEO/fancyInput

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

    <div ac-fancy-input ac-animate="true"></div>

where `ac-animate` controls if the input is animated or not. This is used in combination with:


    <div ac-fancy-input-suggestions>
      <div acfi-content-template>
        <div>{{content.string}}</div>
        <div></div>
      </div>
    </div>

where `acfi-content-template` is the template contained in the ng-repeat of the suggestion box.

##



