# Ideal Forms

**Ideal Forms** is the ultimate framework for building and validating responsive HTML5 forms.

* **[DEMO](http://elclanrs.github.com/jq-idealforms/)**
* **Support:** IE8+, Webkit, Firefox, Opera, iOS 5+.
* **jQuery 1.7+, jQuery UI 1.8+**
* **License:** [GPL](http://www.gnu.org/licenses/gpl.html) or [MIT](http://en.wikipedia.org/wiki/MIT_License)

### Features:
* Fully responsive (AKA adaptive, adapts to the container, no css media queries needed).
* Keyboard support.
* Every input type can be customized including `select`, `radio`, `checkbox` and `file`.
* Custom datepicker using jQuery UI (with fallback)
* "On the spot" validation.
* Localization
* HTML5 `placeholder` for every browser.

### Videos:
* [Adding and removing fields dynamically](http://www.youtube.com/watch?v=z-wPmywl4Tc&feature=youtu.be)

* * *
# Updates:

* New tabs(steps) with new public methods `switchTab`, `nextTab`, `prevTab`, `firstTab` and `lastTab`.
* New custom datepicker (requires jQuery UI)
* New method `removeFields` and new option `addBefore` in addition to `addAfter` for the `addFields` method.
* Added separators and headings with descriptions. Check out demo.

# Help:
```javascript
"Help translating Ideal Forms into other languages."
```
```javascript
"I need feedback for mobile devices. Please report any bugs you might find in iOS or Android."
```
* **[Android - text inputs not validating](http://stackoverflow.com/questions/10822758/android-text-inputs-not-validating-with-custom-validation-plugin)**

# How to use it:

Load the latest [jQuery library](http://jquery.com), the `js/min/jquery.idealforms.min.js` plugin and the `css/jquery.idealforms.css` stylesheet into your project. Load the latest jQuery UI if you want support for datepicker.

Replace your document's opening `<html>` tag with the following conditional comments. This will load the appropiate fixes for all supported IE versions:

```html
<!--[if IE 8]> <html class="ie8" lang="en"> <![endif]-->
<!--[if IE 9]> <html class="ie9" lang="en"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]-->
```

Also, for IE8 support you'll need an [HTML5 shim](http://code.google.com/p/html5shim/) unless you're using [Modernizr](http://modernizr.com/) which already has a shim.

To localize Ideal Forms in your language, load the corresponding file from `js/i18n` after loading the plugin.

## Index

* [Markup](#markup)
* [Invoke the plugin](#invoke-the-plugin)
* [Options](#options)
    * [inputs](#inputs)
    * [customFilters](#customfilters)
    * [customInputs](#custominputs)
    * [customFlags](#customflags)
    * [globalFlags](#globalflags)
    * [onSuccess](#onsuccess)
    * [onFail](#onfail)
    * [responsiveAt](#responsiveat)
* [Built-in filters](#built-in-filters)
* [Built-in flags](#built-in-flags)
* [Methods](#methods)
    * [isValid](#isvalid)
    * [addFields](#addfields)
    * [removeFields](#removefields)
    * [isValidField](#isvalidfield)
    * [getInvalid](#getinvalid)
    * [focusFirst](#focusfirst)
    * [focusFirstInvalid](#focusfirstinvalid)
    * [switchTab](#switchtab)
    * [nextTab](#nexttab)
    * [prevTab](#prevtab)
    * [firstTab](#firsttab)
    * [lastTab](#slasttab)
    * [fresh](#fresh)
    * [reset](#reset)
* [Example](#example)
* [Theming](#theming)

Markup
------

For **Ideal Forms** to work its magic create your markup using the following template as a reference, nothing fancy, just the usual form tags wrapped in a `<div>`. Drop the form into a container of any size and Ideal Forms will do the rest.

If you're working with dynamic fields check documentation on **[addFields](#addfields)**.

```html
<form id="my-form">

  <!-- TAB -->
  <section name="First tab">

    <!-- Heading -->
    <div>
      <h1>My Heading</h1>
      <p>Description here</p>
    </div>

    <!-- Text -->
    <div><label>Username:</label><input type="text" name="username"/></div>
    <div><label>Date:</label><input type="text" name="date" placeholder="mm/dd/yy"/></div>
    <div><label>Comments:</label><textarea name="comments"></textarea></div>

    <!-- File -->
    <div><label>File Upload:</label><input type="file" multiple name="file"/></div>

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

  <section> <!-- END TAB -->

  <!-- TAB -->
  <section name="Second tab">

    <div>
      <h1>My Heading</h1>
      <p>Description here</p>
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

  <section> <!-- END TAB -->

  <!-- Separator -->
  <div><hr/></div>

  <!-- Buttons -->
  <div><input type="sumbit" value="Submit"/></div>
  <div><button>Reset</button></div>

</form>
```

The `name` attribute will be used in the plugin's options to add filters to each input. This provides a lot of flexibility and the possibility to create custom errors, and tweak the filter's values.

Alternatively, for very simple forms, you can do it "the easy way" and just add the filters as classes.
```html
<form id="my-form">
  <div><label>Username:</label><input type="text" name="username" class="required username"/></div>
  <div><label>Password:</label><input type="text" name="password" class="required password"/></div>
  <div><label>E-Mail:</label><input type="text" name="email" class="required email"/></div>
</form>
```

Invoke the plugin
-----------------
Call **Ideal Forms** on each form separately. Assign each form to a variable to have access to the [public methods](#methods).
```javascript
var $myform = $('#my-form').idealforms({ options });
```

Options
-------

####`inputs`
Add all the inputs you want to validate here. Use the name attribute of the input as key. To be consistent always put the key in quotes. Array group names can be used too, ie. `name[]`.

Each input can be customized with **filters**, **data**, **errors** and **flags**.

* `filters`: A space separated string of filters.
* `data`: Filters that take values can be specified in here. Check documentation on **[Built-in filters](#built-in-filters)** for more info.
* `errors`: Use the filter name as the key value and add your custom error. You can use inline HTML tags within the error string.
* `flags`: Flags are simply functions that run when an input tries to validate. See documentation on **[Built-in flags](#built-in-flags)** and **[customFlags](#customflags)**.

```javascript
inputs: {
  // The name attribute of the input in quotes
  'myinput': {
    filters: 'required min',
    data: {
      min: 10
    },
    errors: {
      min: 'At least 10 characters'
    },
    flags: 'noclass noinvalidicon'
  }
}
```

####`customFilters`
Adding custom filters is very easy and straightforward.

```javascript
customFilters: {
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
     * @return {bool} Truthy or falsy values too
     */
    regex: function(input, value) {
      // Declare error within `regex`
      // to have access to `value` and `input`
      this.error = 'My custom ' + value;
    }
  }
}
```

####`customInputs`
Disables custom inputs and uses system default. (select, radio, checkbox, button, file)
```javascript
customInputs: false
```

####`customFlags`
Add custom flags:

```javascript
customFlags: {
  /*
   * @param input jQuery input object
   * @param event The event that was triggered on the input (focus, blur, change, keyup)
   */
  custom: function(input, event){
    if (event === 'keyup') console.log(input.val())
  }
}
```

####`globalFlags`
List the flags that you want to apply to all inputs.
```javascript
globalFlags: 'noerror noicons'
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
Must be between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)

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
Must be a valid date. This filter effectively validates a date, so stuff like `02-31-2012` or `30/80/2000` would be invalid. You can use any format with 4 digit year and any delimiter character. The default format is `mm/dd/yyyy`.

If you're loading jQuery UI, Ideal Forms will detect it and use the datepicker plugin to choose dates. It will also apply the custom format that you specify without having to configure the datepicker. It's seamless.

```javascript
'myinput': {
  filters: 'date',
  data: {
    date: 'dd-mm-yyyy' // or `yyyy~dd~mm` or `mm*yyyy*dd`...
  }
}
```

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
* Prevent validation if the value matches any value in the given array.
* Use this filter to exclude the default (usually first) option of a `select` input.
* Useful to validate usernames from a database; just pull a list of the usernames that are already taken and pass in an array. Store the array in an external variable and as the array is updated Ideal Forms will respond accordingly.

```javascript
'myinput': {
  filters: 'exclude',
  data: {
    // Always an array even if just one value
    // Values are case-sensitive
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

####`extension`
This filter is designed for `file` inputs. It supports multifile in HTML5 browsers.
```javascript
'myinput': {
  filters: 'extension',
  data: {
    extension: ['jpg', 'png'] // Always array even if just one
  }
}
```

Built-in flags
--------------
* `noerror`: hide the error from the input
* `noicons`: hide the icons
* `novalidicon`
* `noinvalidicon`
* `noclass`: no valid/invalid class
* `novalidclass`
* `noinvalidclass`

Methods
-------

####`isValid`
Check if the form is valid.

**chainable**: no
```javascript
if ($myform.isValid()) {
  // do something...
}
```

####`addFields`
Add fields to the form dynamically. It takes an array of objects. Ideal Forms auto-generates the markup for inputs fields based on the `type` specified.

**chainable**: yes

#####`name` (required)
The value used as name attribute.
#####`title` (required)
The label text.
#####`addBefore`
Insert the new field before an existing field. Takes a string. Ideal Forms will look for `name` first and then `id`.
#####`addAfter`
Insert the new field after an existing field.
#####`type` (required)
`text`, `password`, `email`, `number` ,`search`, `url` ,`tel`, `file`, `select`, `radio` and `checkbox`.
#####`list`
Array of items for inputs such as `select`, `radio` and `checkbox`.
#####`placeholder`
The placeholder for text inputs. Use `exclude` for select menus.
#####`filters`, `data`, `errors`, `flags`

For more info check documentation on **[input's options](#inputs)**.

```javascript
var newFields = [
  {
    name: 'animals[]',
    title: 'Animals',
    addAfter: 'email',
    type: 'radio',
    list: ['Dog', 'Elephant', 'Crocodile', 'Spider']
  },
  {
    name: 'zip',
    title: 'Zip Code',
    filters: 'required zip',
    type: 'text'
  },
  {
    name: 'instruments',
    title: 'Instruments',
    addBefore: 'langs[]',
    filters: 'exclude',
    data: { exclude: ['Select an instrument'] },
    errors: { exclude: 'Please select an instrument' },
    type: 'select',
    list: [
      'Select an instrument',
      'Piano',
      'Violin',
      'Guitar'
    ]
  }
]
$myform.addFields(newFields)
```

####`removeFields`
Remove fields from the form dynamically. It takes an array of names or id's. Ideal Forms will look for the `name` attribute first and then `id`.

**chainable:** yes

```javascript
var fields = [
  'username',
  'password',
  'email'
]
$myform.removeFields(fields)
```

####`isValidField`
Check if a particular field is valid. The function takes a string. Ideal Forms will look for the name attribute first and then for the id. You can use array group names for groups of checkboxes.

**chainable**: no
```javascript
if ($myform.isValidField('username')) { // name="username" OR #username
  // do something...
}
if ($myform.isValidField('colors[]')) { // name="colors[]"
  // do something...
}
```

####`getInvalid`
Get all invalid fields. Returns a jQuery object. You can also filter by tab name to get all invalid fields within a tab.

**chainable**: yes (but it doesn't return the form, just the invalid fields)

```javascript
var numInvalid = $myform.getInvalid().length // How many invalid fields
var numInvalidTab = $myform.getInvalid('My Section').length
```

####`focusFirst`
Focus the very first field.

**chainable**: yes
```javascript
$myform.focusFirst()
```

####`focusFirstInvalid`
Focus the first invalid field.

**chainable**: yes
```javascript
$myform.focusFirstInvalid()
```

####`switchTab`
Change tab by name.

**chainable**: yes
```javascript
$myform.switchTab('My Section')
```

####`nextTab`
Go to next tab.

**chainable**: yes
```javascript
$myform.nextTab()
```

####`prevTab`
Go to previous tab.

**chainable**: yes
```javascript
$myform.prevTab()
```

####`firstTab`
Go to first tab.

**chainable**: yes
```javascript
$myform.firstTab()
```

####`lastTab`
Go to last tab.

**chainable**: yes
```javascript
$myform.lastTab()
```

####`fresh`
Load the form as if it was never focused. This removes `valid` and `invalid` classes until first focus.

**chainable**: yes
```javascript
$myform.reset().fresh() // Usually combined with `reset()`
```

####`reset`
Reset all fields to zero including checkboxes, radios, and selects.

**chainable**: yes
```javascript
$myform.reset()
```

Example
-------
With the markup provided above you'd call the plugin like this:

```javascript
$myform.idealforms({

  inputs: {
    'username': {
      filters: 'required username exclude',
      data: {
        exclude: ['user', 'username', 'admin']
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
        exclude: 'Choose a color from the list.'
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
      },
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

### Custom UI elements:
Here's a list of all the Ideal Forms UI elements that can be customized:
* Tabs
* Labels
* Headings
* Separators
* Icons
* Errors
* Text inputs
* Buttons
* Select dropdowns
* Radios
* Checkboxes
* Datepicker

Really, ANYTHING.

### User config:

All user options are located in `less/themes/theme/theme.less`. You can safely edit all values from the "user config". The "extra" options must be edited wisely since most of the variables here are relative to other variables defined elsewhere.

The names of the user config variables are pretty self-explanatory. If you screw up you can always go back.
When you finish editing the user config don't forget to load your theme in `less/jquery.idealforms.less` and compile into `css`.

####`@font-size`
The overall font size. Usually adjusting this option should be enough in most cases. Keep in mind that the bigger the font, the bigger the icons need to be. Ideal Forms will try to align everything as close as possible, but it's recommended that the icons are aprox. the same size as the font-size.

####`@small-font-size`
Ideal Forms uses a smaller font-size for `button`, `select`, `radio`, `checkbox` and `file`. This makes UI elements stand out more and feel more integrated. Change to `100%` to use the default font-size.

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
