![Ideal Forms logo](http://i.imgur.com/SdOk2.jpg)

**Ideal Forms** is the ultimate framework for building and validating responsive HTML5 forms.

* **[DEMO](http://elclanrs.github.com/jq-idealforms/)**
* **Support:** IE8+, Webkit, Firefox, Opera, iOS 5+, Android 4.0+.
* **jQuery 1.7+, UI 1.8+**
* **License:** [GPL](http://www.gnu.org/licenses/gpl.html) or [MIT](http://en.wikipedia.org/wiki/MIT_License)
* [Download as zip](https://github.com/elclanrs/jq-idealforms/raw/master/zip/jquery.idealforms.zip)

###  Features:
* Fully responsive (AKA adaptive, adapts to the container, no css media queries needed)
* Keyboard support
* Every input type can be customized including `select`, `radio`, `checkbox` and `file`
* Custom datepicker using jQuery UI (with fallback)
* "On the spot" validation
* Localization

### Updates:
**02/26/13**
- Update grunt to 0.4.0 and fix alignment issues css

[Update history](#update-history)

###  Videos:
* [Simulating slow AJAX requests with loading status](http://www.youtube.com/watch?v=-FSShf8jlAg)
* [Adding and removing fields dynamically](http://www.youtube.com/watch?v=z-wPmywl4Tc&feature=youtu.be)

###  FAQ:
* [Integrating Google reCAPTCHA](https://github.com/elclanrs/jq-idealforms/issues/30)
* [Playing nice with Twitter Bootstrap](https://github.com/elclanrs/jq-idealforms/issues/32#issuecomment-7747413)
* [Submit form with AJAX](https://github.com/elclanrs/jq-idealforms/issues/42)

###  Help:
* Help localizing Ideal Forms in other languages.

Table of contents:
------------------

- [Setup](#setup)
- [Markup](#markup)
- [Options](#options)
    - [inputs](#inputs)
    - [globalFlags](#globalflags)
    - [onSuccess](#onsuccess)
    - [onFail](#onfail)
    - [responsiveAt](#responsiveat)
    - [disableCustom](#disablecustom)
- [Filters](#filters)
- [Flags](#flags)
- [Adding custom filters and flags](#adding-custom-filters-and-flags)
- [Methods](#methods)
    - [setOptions](#setoptions)
    - [setFieldOptions](#setfieldoptions)
    - [isValid](#isvalid)
    - [isValidField](#isvalidfield)
    - [getInvalid](#getinvalid)
    - [getInvalidInTab](#getinvalidintab)
    - [addFields](#addfields)
    - [removeFields](#removefields)
    - [toggleFields](#togglefields)
    - [focusFirst](#focusfirst)
    - [focusFirstInvalid](#focusfirstinvalid)
    - [switchTab](#switchtab)
    - [nextTab](#nexttab)
    - [prevTab](#prevtab)
    - [firstTab](#firsttab)
    - [lastTab](#slasttab)
    - [reset](#reset)
    - [resetFields](#resetfields)
    - [fresh](#fresh)
    - [freshFields](#freshfields)
    - [reload](#reload)
- [Example](#example)
- [Theming](#theming)

Setup:
-----

* Load [jQuery library](http://jquery.com)
* Load `js/min/jquery.idealforms.min.js` plugin
* Load `css/jquery.idealforms.css` stylesheet
* Load [jQuery UI](http://jqueryui.com/) for datepicker support
* Replace your document's opening `<html>` tag with the following conditional comments. This will load the appropiate fixes for all supported IE versions:

```html
<!--[if IE 8]> <html class="ie8" lang="en"> <![endif]-->
<!--[if IE 9]> <html class="ie9" lang="en"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]-->
```

* Load an [HTML5 shim](http://code.google.com/p/html5shim/) for IE8 unless you're using [Modernizr](http://modernizr.com/) which already has a shim.
* To localize Ideal Forms in your language, load the corresponding file from `js/i18n` after loading the plugin.
* Finally, call Ideal Forms on each form separately. Assign each form to a variable to have access to the public methods.

```javascript
var $myform = $('#my-form').idealforms({ options }).data('idealforms');
```

Markup:
------

For Ideal Forms to work its magic create your markup using the following template as a reference, nothing fancy, just the usual form tags wrapped in a `<div>`. Drop the form into a container of any size and Ideal Forms will do the rest.

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
    <div><label>Date:</label><input type="text" name="date" class="datepicker" placeholder="mm/dd/yy"/></div>
    <div><label>Comments:</label><textarea name="comments"></textarea></div>

    <!-- File -->
    <div><label>File Upload:</label><input type="file" multiple name="file"/></div>

    <!-- Select -->
    <div>
      <label>Colors:</label>
      <select name="colors">
          <option value="default">Choose a color</option>
          <option value="Red">Red</option>
          <option value="Blue">Blue</option>
          <option value="Green">Green</option>
      </select>
    </div>

  </section> <!-- END TAB -->

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

  </section> <!-- END TAB -->

  <!-- Separator -->
  <div><hr/></div>

  <!-- Buttons -->
  <div>
    <button type="submit">Submit</button>
    <button id="reset" type="button">Reset</button>
  </div>

</form>
```

The `name` attribute will be used in the plugin's options to add filters to each input. This provides a lot of flexibility and the possibility to create custom errors, and tweak the filter's values.

Alternatively, for very simple forms, you can do it "the easy way" and just add the filters to the `data-ideal` attribute.
```html
<form id="my-form">
  <div><label>Username:</label><input type="text" name="username" data-ideal="required username"/></div>
  <div><label>Password:</label><input type="text" name="password" data-ideal="required pass"/></div>
  <div><label>E-Mail:</label><input type="text" name="email" data-ideal="required email"/></div>
</form>
```

**Notes:**
* If you're working with dynamic fields check documentation on [addFields](#addfields).
* If you want to add custom elements to the form _always_ wrap them in a `div` with class `ideal-wrap`.

## Options:

### inputs
Add all the inputs you want to validate here. Use the name attribute of the input as key. To be consistent always put the key in quotes. Array group names can be used too, ie. `name[]`.

* **filters:** A space separated string of filters.
* **data:** Filters that take values can be specified in here. Check documentation on **[Filters](#filters)** for more info.
* **errors:** Use the filter name as the key value and add your custom error. You can use inline HTML tags within the error string.
* **flags:** Flags are simply functions that run when an input tries to validate. See documentation on **[Flags](#flags)**.

```javascript
inputs: {
  // The name attribute of the input in quotes
  'myinput': {
    filters: 'required min',
    data: { min: 10 },
    errors: { min: 'At least 10 characters' },
    flags: 'noclass noinvalidicon'
  }
}
```

### globalFlags
List the flags that you want to apply to all inputs.
```javascript
globalFlags: 'noerror noicons'
```

### onSuccess
```javascript
onSuccess: function(e) {
  // Form validates
}
```

### onFail
```javascript
onFail: function(){
  // Form does NOT validate
}
```

### responsiveAt
By default, Ideal Forms will make the form "adaptive". It will adapt to the container allowing it to work with any responsive grid system.
You can change this behavior by assigning a number value to the `responsiveAt` option.
```javascript
// Make responsive only at a certain window size.
// Default is `"auto"` to adapt to the container
// Set to `false` to disable responsiveness
// To always show the responsive layout use a large number ie `3000`
responsiveAt: 480
```

### disableCustom
Disables custom inputs and uses system default so you can use other replacement plugins.
```javascript
disableCustom: 'file select radiocheck button'
```

## Filters:

### required
The field is required. This filter ONLY works with text inputs (text, password, textarea). For `select` use `exclude` to exclude the default option. For `radio` and `checkbox` use `min: 1` which will require at least one option to be checked.

### number
Must be a number.

### digits
Only digits.

### range
Only numbers within a range. Usually combined with `number` or `digits`.
```javascript
'myinput': {
  filters: 'number range',
  data: { range: [ 1, 100 ] }
}
```

### name
Must be at least 3 characters long, and must only contain letters.

### username
Must be between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)

### pass
Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter.

### strongpass
Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character.

### email
Must be a valid e-mail address.

### phone
Must be a valid US phone number.

### zip
Must be a valid US zip code.

### url
Must be a valid URL.

### date
Must be a valid date. This filter effectively validates a date, so stuff like `02-31-2012` or `30/80/2000` would be invalid. You can use any format with 4 digit year and any delimiter character. The default format is `mm/dd/yyyy`.
```javascript
'myinput': {
  filters: 'date',
  data: { date: 'dd-mm-yyyy' } // or `yyyy~dd~mm` or `mm*yyyy*dd`
}
```
To use the datepicker you need to load jQuery UI and add the class `datepicker` to your date input. Ideal Forms will apply the custom format that you specify without having to configure the datepicker. It's seamless.

### dob
Must be a valid date of birth in this century, that is 100 years range from the current year.

```javascript
'myinput': {
  filters: 'dob',
  data: { dob: 'yyyy/dd/mm' }
}
```

### min
* Must be at least `x` characters minimum.
* Must have at least `x` checkboxes checked.

```javascript
'myinput': {
  filters: 'min',
  data: { min: 10 }
}
```

### max
* `x` characters maximum.
* No more than `x` checkboxes checked.

```javascript
'myinput': {
  filters: 'max',
  data: { max: 10 }
}
```

### exclude
* Prevent validation if the value matches any value in the given array.
* Use this filter to exclude the default (usually first) option of a `select` input.

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

### equalto
The value must match a value of another input.
```javascript
'myinput': {
  filters: 'equalto',
  data: { equalto: '#myid' } // You can use any valid jQuery selector
}
```

### extension
This filter is designed for `file` inputs. It supports multifile in HTML5 browsers.
```javascript
'myinput': {
  filters: 'extension',
  data: { extension: [ 'jpg', 'png' ] } // Always array even if just one
}
```

### ajax
Validate a response from the server. The `ajax` filter must be added at last after all other filters.

This method is a light wrapper around `$.ajax`, so any parameter valid in jQuery's `$.ajax` is also valid in Ideal Forms' `ajax` except `success` and `error` because they are set up automatically but you can use `_success` and `_error` instead.

In most cases passing the `url` should be enough. The server will receive the value of the input in `$_POST[inputname]`. The default `dataType` is `json`. Ideal Forms handles success and error from the server. The field will switch to _loading status_ if the response takes some time to come back. Here's an example in PHP:

**validate.php**
```php
<?php
$usernames = array('mike', 'john', 'louis', 'james'); // Unavailable usernames, usually from a database
sleep(2); // Simulate delay from the server to see loading status
echo json_encode(!in_array($_POST['username'], $usernames));
```

**JavaScript:**
```javascript
'username': {
  filters: 'required username ajax',
  data: {
    ajax: {
      url: 'validate.php',
      _success: function( resp, text, xhr ) {
        // The request was succesful
      },
      _error: function( xhr, text, error ) {
        // The request failed
      },
      // Other $.ajax methods
    }
  },
  errors: {
    ajax: {
      success: 'Username not available.',
      error: 'Sorry, there was an error on the server. Try again later.'
    }
  }
}
```

## Flags:

Flags are custom functions that you can run on an input whenever a validation event is triggered.

* **noerror**: hide the error from the input
* **noicons**: hide the icons
* **novalidicon**
* **noinvalidicon**
* **noclass**: no valid/invalid class
* **novalidclass**
* **noinvalidclass**

## Adding custom filters and flags:

Ideal Forms registers global objects for filters and flags so you can extend it with your own custom object to add more features.

###  Custom filters:
```javascript
$.extend( $.idealforms.filters, {
  custom: {
    regex: /regularexpression/,
    error: 'My custom error'
  },
  another: {
  /**
   * @param {Object} inputData Contains the jQuery input as [input] and
   * the user options set by the user on that input as [userOptions]
   * @param {String} value The value of the input
   */
    regex: function ( inputData, value ) {
      var $input = inputData.input
      var userOptions = inputData.userOptions
      var this.error = 'Something ' + value
    }
  }
})
```

###  Custom flags:
```javascript
$.extend( $.idealforms.flags, {
  /**
   * @param {jQuery} input jQuery input object
   * @param {String} event The event that was triggered on the input: focus, blur, change, keyup
   */
  custom: function( input, event ){
    if ( event === 'keyup' ) {
      console.log( input.val() )
    }
  }
})
```

Methods:
-------

### setOptions

Override the options of the form after being initialized.

**chainable:** yes

```javascript
var myOps = {
  onFail: function() { // override onFail option
    alert('It failed!')
  },
  inputs: {
    'number': { filters: 'number' } // add new input to validate
  }
}
$myform.setOptions( myOps )
```

All options are exposed on `$myform.opts` so you can manually edit them if needed. Make sure to [reload](#reload) the form when doing this.

**Note:** The `disableCustom` option cannot be modified after initialization.

### setFieldOptions

Override the options of a particular field.

**chainable:** yes

```javascript
$myform.setFieldOptions( 'username', { filters: 'username' } )
```

### isValid
Check if the form is valid.

**chainable:** no
```javascript
if ( $myform.isValid() ) {
  // do something...
}
```

### isValidField
Check if a particular field is valid. The function takes a string. Ideal Forms will look for the name attribute first and then for the id. You can use array group names for groups of checkboxes.

**chainable:** no
```javascript
if ( $myform.isValidField('username') ) { // name="username" OR #username
  // do something...
}
if ( $myform.isValidField('colors[]') ) { // name="colors[]"
  // do something...
}
```

### getInvalid
Get all invalid fields. Returns a jQuery object.

**chainable:** yes (but it doesn't return the form, just the invalid fields)

```javascript
var numInvalid = $myform.getInvalid().length // How many invalid fields
```

### getInvalidInTab
Get all invalid fields within a tab.

**chainable:** yes (but it doesn't return the form, just the invalid fields)

```javascript
var numInvalidTab = $myform.getInvalidInTab('My Section').length
```

### addFields
Add fields to the form dynamically. It takes an array of objects or a single object. Ideal Forms auto-generates the markup for inputs fields based on the `type` specified.

**chainable:** yes

* **name** (required):
The value used as name attribute.
* **label** (required):
The label text.
* **type** (required):
`text`, `password`, `email`, `number`, `url` ,`tel`, `file`, `select`, `radio`, `checkbox` and `textarea`.
* **value**:
The value attribute of the field. Check `list` to add values to options.
* **addBefore**:
Insert the new field before an existing field. Takes a string. Ideal Forms will look for `name` first and then `id`.
* **addAfter**:
Insert the new field after an existing field.
* **appendToTab**:
Insert the new field at the end of a section. Takes a string.
* **list**:
Array of items for `select`, `radio` and `checkbox`. Use this format `item::value` to specify the value attribute.
* **placeholder**:
The placeholder for text inputs. Use `exclude` for select menus.
* **filters, data, errors, flags**: Check docs on [inputs](#inputs).

```javascript
var newFields = [
  {
    name: 'animals',
    label: 'Animals',
    type: 'radio',
    list: ['Dog', 'Elephant', 'Crocodile', 'Spider'],
    addAfter: 'email'
  },
  {
    name: 'zip',
    label: 'Zip Code',
    filters: 'required zip',
    type: 'text',
    addBefore: 'password'
  },
  {
    name: 'instruments',
    label: 'Instruments',
    filters: 'exclude',
    data: { exclude: ['default'] },
    errors: { exclude: 'Please select an instrument' },
    type: 'select',
    list: [
      'Select an instrument::default',
      'Piano::pia',
      'Violin::vio',
      'Guitar::gui'
    ],
    appendToTab: 'My Section'
  }
]
$myform.addFields( newFields )
```

### removeFields
Remove fields from the form dynamically. Ideal Forms will look for the `name` attribute first and then `id`.

**chainable:** yes

```javascript
$myform.removeFields('username')
$myform.removeFields([ 'username', 'password', 'email' ])
```

### toggleFields
Hide or show fields. When the fields are hidden they will be excluded from the validation process.

```javascript
$myform.toggleFields('username')
$myform.toggleFields([ 'username', 'password', 'email' ])
```

### focusFirst
Focus the very first field. If there are tabs it will focus the very first field within the current tab.

**chainable:** yes
```javascript
$myform.focusFirst()
```

### focusFirstInvalid
Focus the first invalid field.

**chainable:** yes
```javascript
$myform.focusFirstInvalid()
```

### switchTab
Change tab by name or index.

**chainable:** yes
```javascript
$myform.switchTab('My Section') // case insensitive
$myform.switchTab(2) // zero based index
```

### nextTab
Go to next tab.

**chainable:** yes
```javascript
$myform.nextTab()
```

### prevTab
Go to previous tab.

**chainable:** yes
```javascript
$myform.prevTab()
```

### firstTab
Go to first tab.

**chainable:** yes
```javascript
$myform.firstTab()
```

### lastTab
Go to last tab.

**chainable:** yes
```javascript
$myform.lastTab()
```

### reset
Reset all fields to zero including checkboxes, radios, and selects.

**chainable:** yes
```javascript
$myform.reset() // Reset all
```

### resetFields
Reset particular fields.

**chainable:** yes
```javascript
$myform.resetFields('username')
$myform.resetFields([ 'username', 'password', 'email' ])
```

### fresh
Load the form as if it was never focused. This removes `valid` and `invalid` classes until first focus.

**chainable:** yes
```javascript
$myform.fresh()
```

### freshFields

"Freshen" particular fields.

**chainable:** yes
```javascript
$myform.freshFields('username')
$myform.freshFields([ 'username', 'password', 'email' ])
```

### reload
Re-attach events and re-adjust the form. Use this method when modifying the html or when manually editing the options of the form.

**chainable:** yes
```javascript
$myform.reload().fresh() // Usually combined with `fresh()`
```

Example:
-------
With the [Markup](#markup) provided you'd call the plugin like this:

```javascript
var options = {
  inputs: {
    'username': {
      filters: 'required username exclude',
      data: { exclude: ['user', 'username', 'admin'] }
    },
    'date': { filters: 'date' },
    'comments': {
      filters: 'min max',
      data: { min: 50, max: 200 }
    },
    'colors': {
      filters: 'exclude',
      data: { exclude: ['default'] },
      errors: { exclude: 'Choose a color from the list.' }
    },
    'langs[]': {
      filters: 'min',
      data: { min: 2 },
      errors: { min: 'Check at least <strong>2</strong> languages.' }
    },
    'options': {
      filters: 'min'
      data: { min: 1 },
      errors: { min: 'Check only <strong>1</strong> option.' }
    }
  }
};

var $myform = $('#my-form').idealforms( options ).data('idealforms');
```

Theming:
-------

**Ideal Forms** relays on a carefully crafted [LESS](http://lesscss.org/) stylesheet. Everything is customizable, from the simplest text input, to the select menus, radios, and checkboxes.

Here's a list of all the Ideal Forms UI elements that can be customized: tabs, labels, headings, separators, icons, errors, text inputs, buttons, select dropdowns, radios, checkboxes, datepicker... Really, ANYTHING.

###  User config:

All user options are located in `less/themes/theme/theme.less`. You can safely edit all values from the "user config". The "extra" options must be edited wisely since most of the variables here are relative to other variables defined elsewhere.

The names of the user config variables are pretty self-explanatory. If you screw up you can always go back.
When you finish editing the user config don't forget to load your theme in `less/jquery.idealforms.less` and compile into `css`.

### @font-size
The overall font size. Usually adjusting this option should be enough in most cases. Keep in mind that the bigger the font, the bigger the icons need to be. Ideal Forms will try to align everything as close as possible, but it's recommended that the icons are aprox. the same size as the font-size.

### @small-font-size
Ideal Forms uses a smaller font-size for `button`, `select`, `radio`, `checkbox` and `file`. This makes UI elements stand out more and feel more integrated. Change to `100%` to use the default font-size.

### @input-width
Adjust this option if the form doesn't quite fit your container. It's recommended to use this format `@font-size * number`.
All inputs will have the width set here but you can change the width of any particular input by targeting its id. This won't affect the responsive layout.
```css
#comments { width: 200px; }
```

### @label-align
Align labels to either `left` or `right`.

### @label-width
Most of the time `auto` will work just fine but if you have really long label names then it's a good idea to tweak this value.

### @border-width
Width of every border property. Usually there's no need to change the default value of `1px` unless you want a "thick" border look, suitable for some occasions. `box-shadow` properties depend on this option.

### @border-radius
Radius for round corners.

### @css3-anim
`true` or `false` to enable or disable css3 animations (transitions).

### @css3-effects
`true` or `false` to enable or disable css3 box-shadow and gradients.

**Enjoy :)**

Update History:
--------------
**02/21/13**
* Fix #116 tab issue by escaping regex
* Fix overlapping selects (z-index issues)

**01/28/13**
* Fix z-index issues with datepicker.

**11/29/12**
* Add flags to grunt build and fix globalFlags not loading.

**11/21/12**
* Prevent modifier keys ( ctrl, meta, super... ) in select menu to avoid regexp error.

**11/01/12**
* Refactor custom file because of bug that prevented IE from submitting the file.

**10/24/12**
* Fix serious bug in `_adjust` that caused weird behaviors with some methods.

**10/12/12**
* Setup grunt.js
* Massive refactoring and cleanup

**10/11/12**
* Remove `placeholder` polyfill. It was buggy and unfinished. Check for better polyfills [here](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills)
* Re-organize and cleanup validate method
* Restore flags, big regression, ooops!
* Fix some undefined errors with non-existent flags and filters

**10/09/12**
* New [ajax](#ajax) filter
* Sprite for validation icons

**10/07/12**
* Better `number` filter

**10/02/12**
* use `data-ideal` instead of class
* cleanup and optimize radiocheck.js
* fix datepicker undefined error
* fix duplicated tabs with multiple forms
