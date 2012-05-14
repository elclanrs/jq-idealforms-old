* * *

**[DEMO](http://elclanrs.github.com/jq-idealforms/)**  
**Tested:** IE8+, Webkit, Firefox & Opera

* * *

# What's jq-idealforms:

**jq-idealforms** is a small framework to build awesome responsive forms. It's built on top of jQuery and LESS.

### Features:
* Fully responsive (aka adaptive, adapts to the container, no css media queries needed)
* Keyboard support
* All input types are fully customizable built with [LESS](http://lesscss.org/).
* "On the spot" validation
* `placeholder` support for every browser

Check out the **[demo](http://elclanrs.github.com/jq-idealforms/)**!

# How to use it:

Load the latest [jQuery library](http://jquery.com), the `jq-idealforms.js` plugin and the `jq-idealforms.css` stylesheet into your project as well as the [`normalize.css`](http://necolas.github.com/normalize.css/) reset.

Markup
------

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

Invoke the plugin
-----------------
Call your plugin on each form separately.
```javascript
$('#my-form').idealforms({ options });
```

Options
-------

####`inputs`

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
        }
    }
}
``` 
####`filters`

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
By default, jq-idealforms will make the form "adaptive". It will adapt to the container allowing it to work with any grid responsive grid system.
You can change this behavior by assigning a number value to the `responsiveAt` option.
```javascript
// Make responsive only at a certain window size.
// Default is `auto` to adapt to the container
// Set to `false` to disable responsiveness
responsiveAt: 480
```

####`customInputs`
Disable custom inputs (select, radio, checkbox, button) 
```javascript
customInputs: false
```

Built-in filters:
-----------------
You may use any of these filters in any order.

####`required`
The field is required.

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

####`min`
* Must be at least `x` characters minimum.
* Must have at least `x` checkboxes checked.

####`max`
* `x` characters maximum.
* No more than `x` checkboxes checked.

####`date`
Must be a valid date in this format `mm/dd/yy`

####`exclude`
* Prevent validation if the value matches any value in the given array.

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

**jq-idealforms** relays on a carefully crafted [LESS](http://lesscss.org/) stylesheet, `../css/jq-idealforms.less`. From this file you can tweak every detail of the input's appearance, from the simplest text input, to the select menus, radios, and checkboxes.

When you open `jq-idealforms.less`, all user options are located at the beginning of the file. You can safely edit all values from the "user config". The "extra" options must be edited wisely since most of the variables here are relative to other variables defined elsewhere.

The names of the user config variables are pretty self-explanatory. If you screw up you can always go back.

You'll have to try out different `@input-width` depending on your container's width. Usually, adjusting the font should be enough in most cases, but if the font becomes too big or too small then it's a good idea to tweak the input's and/or error's width. The error is included in the width of the form, meaning that the form will become responsive as soon as the container can no longer wrap the the field including the error. This helps to prevent the error from hiding outside the window if the form is aligned to the right and the browser's window is small.

The width of all inputs is auto-calculated but you can change the width of any input by targeting its id:

```css
#comments { width: 200px; }
```

Don't forget to compile into `css`.

Enjoy.