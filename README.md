**[DEMO](http://elclanrs.github.com/jq-idealforms/)**

**Support:** IE8+, Webkit, Firefox, Opera, iOS 5+.

**License:** [GPL](http://www.gnu.org/licenses/gpl.html)

* * *
# Updates:

* **NEW** `flags` option. Hide errors and/or icons from a particular input. Create your custom flags.
* **NEW**  `equalsto` filter.
* Add filters by class, [issue #9](https://github.com/elclanrs/jq-idealforms/issues/9).

* * *

# Help:

```javascript
"I need feedback for mobile devices. Please report any bugs you might find in iOS or Android."
```
* **[Android - text inputs not validating](http://stackoverflow.com/questions/10822758/android-text-inputs-not-validating-with-custom-validation-plugin)**

* * *

# What's Ideal Forms:

**Ideal Forms** is a small framework to build awesome responsive forms with validation. It's built on top of jQuery and LESS.

### Features:
* Fully responsive (aka adaptive, adapts to the container, no css media queries needed)
* Keyboard support
* Customizable input types (select, radio, checkbox)
* "On the spot" validation
* Support HTML5 `placeholder` attribute for every browser

Check out the **[demo](http://elclanrs.github.com/jq-idealforms/)**!

# How to use it:

Load the latest [jQuery library](http://jquery.com), the `js/min/jquery.idealforms.min.js` plugin and the `css/jquery.idealforms.css` stylesheet into your project.

Markup
------

For **Ideal Forms** to work its magic create your markup using the following template as a reference, nothing fancy, just the usual form tags wrapped in a `<div>`. Drop the form into a container of any size and Ideal Forms will do the rest.

```html
<form id="my-form">

    <!-- Text -->
    <div><label>Username:</label><input name="username" type="text" /></div>
    <div><label>Date:</label><input name="date" type="text" placeholder="mm/dd/yy"/></div>
    <div><label>Comments:</label><textarea name="comments"></textarea></div>

    <!-- Select -->
    <div>
        <label>Colors:</label>
        <select name="colors">
            <option value="Choose a color">Choose a color</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
        </select>
    </div>

    <!-- Checkbox -->
    <div>
        <label>Languages:</label>
        <label><input type="checkbox" name="langs[]" value="English"/>English</label>
        <label><input type="checkbox" name="langs[]" value="Chinese"/>Chinese</label>
        <label><input type="checkbox" name="langs[]" value="Spanish"/>Spanish</label>
    </div>

    <!-- Radio -->
    <div>
        <label>Options:</label>
        <label><input type="radio" name="options" value="One"/>One</label>
        <label><input type="radio" name="options" value="Two"/>Two</label>
        <label><input type="radio" name="options" value="Three"/>Three</label>
    </div>

    <!-- Buttons -->
    <!-- Empty label to align with all the other inputs -->
    <div><label>&nbsp;</label><input type="button" value="Button"/></div>
    <div><label>&nbsp;</label><button>Button</button></div>

</form>
```
  Alternatively, for very simple forms, you can do it "the easy way" and just add the filters as classes and not bother about the plugin's options.
```html
<div><label>Username:</label><input name="username" type="text" /></div>
```

Invoke the plugin
-----------------
Call **Ideal Forms** on each form separately.
```javascript
$('#my-form').idealforms({ options });
```

Options
-------

####`inputs`
Add all the inputs you want to validate here. Use the name attribute of the input as key. To be consistent always put the key in quotes. Array group names can be used too, ie. `name[]`.

```javascript
inputs: {
    // The name attribute of the input in quotes
    'name': {
        filters: 'filterName filterName filterName', // {string} Space separated list
        // Some filters take a `data` attribute
        // such as `exclude`, `min` and `max`
        data: {
            filterName: data // {number, array, string}
        },
        // Custom errors
        errors: {
            filterName: error // {string} Can contain inline HTML tags
        },
        flags: 'noerror noicons novalidicon noinvalidicon'
    }
}
```
####`filters`
Adding custom filters is very easy and straightforward.

```javascript
filters: {
    custom: {
        regex: /regularexpression/,
        error: 'My custom error'
    },
    another: {
         /**
         * @param {object} input Contains two objects,
         * the user options of the input as [input.userOptions]
         * and the jQuery element as [input.input]
         * @param {string} value The value of the input
         */
        regex: function(input, value) {
            // Declare error within `regex`
            // to have access to `value` and `input`
            this.error = 'My custom ' + value;
        }
    }
}
```

####`onSuccess`
```javascript
onSuccess: function(e){
    // Form validates
}
```

####`onFail`
```javascript
onFail: function(){
    // Form does NOT validate
}
```

####`responsiveAt`
By default, Ideal Forms will make the form "adaptive". It will adapt to the container allowing it to work with any responsive grid system.
You can change this behavior by assigning a number value to the `responsiveAt` option.
```javascript
// Make responsive only at a certain window size.
// Default is `"auto"` to adapt to the container
// Set to `false` to disable responsiveness
// To always show the responsive layout use a large number ie `3000`
responsiveAt: 480
```

####`customInputs`
Disables custom inputs and uses system default. (select, radio, checkbox, button)
```javascript
customInputs: false
```

Built-in filters
----------------
You may use any of these filters in any order.

####`required`
The field is required. This filter ONLY works with text inputs (text, password, textarea). For `select` use `exclude` to exclude the default option. For `radio` and `checkbox` use `min: 1` which will require at least one option to be checked.

####`number`
Must be a number.

####`digits`
Only digits.

####`name`
Must be at least 3 characters long, and must only contain letters.

####`username`
Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)

####`pass`
Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter.

####`strongpass`
Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character.

####`email`
Must be a valid e-mail address.

####`phone`
Must be a valid US phone number.

####`zip`
Must be a valid US zip code.

####`url`
Must be a valid URL.

####`date`
Must be a valid date in this format `mm/dd/yy`

####`min`
* Must be at least `x` characters minimum.
* Must have at least `x` checkboxes checked.

```javascript
'myinput': {
  filters: 'min',
  data: {
    min: 10
  }
}
```

####`max`
* `x` characters maximum.
* No more than `x` checkboxes checked.

```javascript
'myinput': {
  filters: 'max',
  data: {
    max: 10
  }
}
```

####`exclude`
Prevent validation if the value matches any value in the given array.
```javascript
'myinput': {
  filters: 'exclude',
  data: {
    // Always an array even if just one value
    exclude: ['one', 'two', 'three']
  }
}
```

####`equalto`
The value must match a value of another input.
```javascript
'myinput': {
  filters: 'equalto',
  data: {
    // You can use any valid jQuery selector
    equalto: '#myid'
  }
}
```

Example
-------
With the markup provided above you'd call the plugin like this:

```javascript
$('#my-form').idealforms({

    // For consistency all keys
    // must be in quotes
    inputs: {
        'username': {
            filters: 'required username exclude',
            data: {
                exclude: ['user', 'username', 'admin'] // Case sensitive
            }
        },
        'date': {
            filters: 'date'
        },
        'comments': {
            filters: 'min max',
            data: {
                min: 50
                max: 200
            }
        },
        'colors': {
            filters: 'exclude',
            data: {
                exclude: ['Choose a color']
            },
            errors: {
                exclude: 'Choose a color from the list.' // Custom error
            }
        },
        'langs[]': {
            filters: 'min',
            data: {
                min: 2
            },
            errors: {
                min: 'Check at least <strong>2</strong> languages.'
            }
        },
        'options': {
            filters: 'min'
            data: {
                min: 1
            }
            errors: {
                min: 'Check only <strong>1</strong> option.'
            }
        }
    }
});
```

Theming
-------

**Ideal Forms** relays on a carefully crafted [LESS](http://lesscss.org/) stylesheet. Everything is customizable, from the simplest text input, to the select menus, radios, and checkboxes.

### User config:

All user options are located in `less/user.config.less`. You can safely edit all values from the "user config". The "extra" options must be edited wisely since most of the variables here are relative to other variables defined elsewhere.

The names of the user config variables are pretty self-explanatory. If you screw up you can always go back.

When you finish editing the user config don't forget to compile `less/jquery.idealforms.less` into `css`.

####`@font-size`
The overall font size. Usually adjusting this option should be enough in most cases. Keep in mind that the bigger the font, the bigger the icons need to be. Ideal Forms will try to align everything as close as possible, but it's recommended that the icons are aprox. the same size as the font-size.

####`@small-font-size`
Ideal Forms uses a smaller font-size for `button`, `select`, `radio` and `checkbox`. Change to `100%` to use the default font-size.

####`@input-width`
Adjust this option if the form doesn't quite fit your container. It's recommended to use this format `@font-size * number`.
All inputs will have the width set here but you can change the width of any particular input by targeting its id. This won't affect the responsive layout.
```css
#comments { width: 200px; }
```

####`@label-align`
Align labels to either `left` or `right`.

####`@label-width`
Most of the time `auto` will work just fine but if you have really long label names then it's a good idea to tweak this value.

####`@border-width`
Width of every border property. Usually there's no need to change the default value of `1px` unless you want a "thick" border look, suitable for some occasions. `box-shadow` properties depend on this option.

####`@border-radius`
Radius for round corners.

####`@css3-anim`
`true` or `false` to enable or disable css3 animations (transitions).

####`@css3-effects`
`true` or `false` to enable or disable css3 box-shadow and gradients.

**Enjoy :)**
