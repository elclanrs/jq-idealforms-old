* * *

**[DEMO](http://elclanrs.github.com/jq-idealforms/)**  
**Tested:** IE8+, Webkit, Firefox & Opera

* * *

# What's jq-idealforms:

**jq-idealforms** is a small jQuery plugin to build awesome responsive forms with customizable input elements, full keyboard support and "on the spot" validation.

### Features:
* Fully responsive (aka adaptative, adapts to the container, no css media queries needed)
* Keyboard support
* Customizable input types with [LESS](http://lesscss.org/).
* "On the spot" validation
* `placeholder` support for every browser

Check out the **[demo](http://elclanrs.github.com/jq-idealforms/)**!

# How to use it:

Load the latest [jQuery library](http://jquery.com), the `jq-idealforms.js` plugin and the `jq-idealforms.css` stylesheet into your project as well as the [`normalize.css`](http://necolas.github.com/normalize.css/) reset.

### HTML:

```html
<form id="my-form">

    <!-- Text -->
    <p><label>Username:</label><input name="username" type="text" /></p>
    <p><label>Date:</label><input name="date" type="text" placeholder="mm/dd/yy"/></p>
    <p><label>Comments:</label><textarea name="comments"></textarea></p>

    <!-- Select -->
    <p>
        <select name="colors">
            <option value="Choose a color">Choose a color</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
        </select>
    </p>

    <!-- Checkbox -->
    <p>
        <label>Languages:</label>
        <label><input type="checkbox" name="langs[]" value="English"/>English</label>
        <label><input type="checkbox" name="langs[]" value="Chinese"/>Chinese</label>
        <label><input type="checkbox" name="langs[]" value="Spanish"/>Spanish</label>
    </p>

    <!-- Radio -->
    <p>
        <label>Options:</label>
        <label><input type="radio" name="radio"/>One</label>
        <label><input type="radio" name="radio"/>Two</label>
        <label><input type="radio" name="radio"/>Three</label>
    </p>

</form>
```

### jQuery:

**Filters**
* required
The filed is required.
* number
* digits
* name
* username
* pass
* stringpass
* email
* phone
* zip
* url
* min
* max
* date
* exclude

```javascript
$('#my-form').quickValidate({
    
    // For consistency all keys
    // must be in quotes
    inputs: {
        'username': {
            filters: 'required username'
        }
    }
    
});
```