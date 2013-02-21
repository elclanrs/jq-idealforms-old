/**
 * @namespace Errors
 * @locale en
 */
$.idealforms.errors = {

  required: 'This field is required.',
  number: 'Must be a number.',
  digits: 'Must be only digits.',
  name: 'Must be at least 3 characters long, and must only contain letters.',
  username: 'Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)',
  pass: 'Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter.',
  strongpass: 'Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character.',
  email: 'Must be a valid e-mail address. <em>(e.g. user@gmail.com)</em>',
  phone: 'Must be a valid US phone number. <em>(e.g. 555-123-4567)</em>',
  zip: 'Must be a valid US zip code. <em>(e.g. 33245 or 33245-0003)</em>',
  url: 'Must be a valid URL. <em>(e.g. www.google.com)</em>',
  minChar: 'Must be at least <strong>{0}</strong> characters long.',
  minOption: 'Check at least <strong>{0}</strong> options.',
  maxChar: 'No more than <strong>{0}</strong> characters long.',
  maxOption: 'No more than <strong>{0}</strong> options allowed.',
  range: 'Must be a number between {0} and {1}.',
  date: 'Must be a valid date. <em>(e.g. {0})</em>',
  dob: 'Must be a valid date of birth.',
  exclude: '"{0}" is not available.',
  excludeOption: '{0}',
  equalto: 'Must be the same value as <strong>"{0}"</strong>',
  extension: 'File(s) must have a valid extension. <em>(e.g. "{0}")</em>',
  ajaxSuccess: '<strong>{0}</strong> is not available.',
  ajaxError: 'Server error...'

}

/**
 * Get all default filters
 * @returns object
 */
var getFilters = function() {

  var filters = {

    required: {
      regex: /.+/,
      error: $.idealforms.errors.required
    },

    number: {
      regex: function( i, v ) { return !isNaN(v) },
      error: $.idealforms.errors.number
    },

    digits: {
      regex: /^\d+$/,
      error: $.idealforms.errors.digits
    },

    name: {
      regex: /^[A-Za-z]{3,}$/,
      error: $.idealforms.errors.name
    },

    username: {
      regex: /^[a-z](?=[\w.]{3,31}$)\w*\.?\w*$/i,
      error: $.idealforms.errors.username
    },

    pass: {
      regex: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
      error: $.idealforms.errors.pass
    },

    strongpass: {
      regex: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      error: $.idealforms.errors.strongpass
    },

    email: {
      regex: /[^@]+@[^@]/,
      error: $.idealforms.errors.email
    },

    phone: {
      regex: /^[2-9]\d{2}-\d{3}-\d{4}$/,
      error: $.idealforms.errors.phone
    },

    zip: {
      regex: /^\d{5}$|^\d{5}-\d{4}$/,
      error: $.idealforms.errors.zip
    },

    url: {
      regex: /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{2,6}([\:\/?#].*)?$/i,
      error: $.idealforms.errors.url
    },

    min: {
      regex: function( input, value ) {
        var $input = input.input,
            min = input.userOptions.data.min,
            isRadioCheck = $input.is('[type="checkbox"], [type="radio"]')
        if ( isRadioCheck ) {
          this.error = $.idealforms.errors.minOption.replace( '{0}', min )
          return $input.filter(':checked').length >= min
        }
        this.error = $.idealforms.errors.minChar.replace( '{0}', min )
        return value.length >= min
      }
    },

    max: {
      regex: function( input, value ) {
        var $input = input.input,
            max = input.userOptions.data.max,
            isRadioCheck = $input.is('[type="checkbox"], [type="radio"]')
        if ( isRadioCheck ) {
          this.error = $.idealforms.errors.maxOption.replace( '{0}', max )
          return $input.filter(':checked').length <= max
        }
        this.error = $.idealforms.errors.maxChar.replace( '{0}', max )
        return value.length <= max
      }
    },

    range: {
      regex: function( input, value ) {
        var range = input.userOptions.data.range,
            val = +value
        this.error = $.idealforms.errors.range
          .replace( '{0}', range[0] )
          .replace( '{1}', range[1] )
        return val >= range[0] && val <= range[1]
      }
    },

    date: {
      regex: function( input, value ) {
        var

        userFormat =
          input.userOptions.data && input.userOptions.data.date
            ? input.userOptions.data.date
            : 'mm/dd/yyyy', // default format

        delimiter = /[^mdy]/.exec( userFormat )[0],
        theFormat = userFormat.split(delimiter),
        theDate = value.split(delimiter),

        isDate = function( date, format ) {
          var m, d, y
          for ( var i = 0, len = format.length; i < len; i++ ) {
            if ( /m/.test( format[i]) ) m = date[i]
            if ( /d/.test( format[i]) ) d = date[i]
            if ( /y/.test( format[i]) ) y = date[i]
          }
          return (
            m > 0 && m < 13 &&
            y && y.length === 4 &&
            d > 0 && d <= ( new Date( y, m, 0 ) ).getDate()
          )
        }

        this.error = $.idealforms.errors.date.replace( '{0}', userFormat )

        return isDate( theDate, theFormat )
      }
    },

    dob: {
      regex: function( input, value ) {
        var

        userFormat =
          input.userOptions.data && input.userOptions.data.dob
            ? input.userOptions.data.dob
            : 'mm/dd/yyyy', // default format

        // Simulate a date input
        dateInput = {
          input: input.input,
          userOptions: {
            data: { date: userFormat }
          }
        },

        // Use internal date filter to validate the date
        isDate = filters.date.regex( dateInput, value ),

        // DOB
        theYear = /\d{4}/.exec( value ),
        maxYear = new Date().getFullYear(), // Current year
        minYear = maxYear - 100

        this.error = $.idealforms.errors.dob

        return isDate && theYear >= minYear && theYear <= maxYear
      }
    },

    exclude: {
      regex: function( input, value ) {
        var $input = input.input,
            exclude = input.userOptions.data.exclude,
            isOption = $input.is('[type="checkbox"], [type="radio"], select')
        this.error = isOption
          ? $.idealforms.errors.excludeOption.replace( '{0}', value )
          : this.error = $.idealforms.errors.exclude.replace( '{0}', value )
        return $.inArray( value, exclude ) === -1
      }
    },

    equalto: {
      regex: function( input, value ) {
        var $equals = $( input.userOptions.data.equalto ),
            $input = input.input,
            name = $equals.attr('name') || $equals.attr('id'),
            isValid = $equals.parents('.ideal-field')
              .filter(function(){ return $(this).data('ideal-isvalid') === true })
              .length
        if ( !isValid ) { return false }
        this.error = $.idealforms.errors.equalto.replace( '{0}', name )
        return $input.val() === $equals.val()
      }
    },

    extension: {
      regex: function( input, value ) {
        var files = input.input[0].files || [{ name: value }],
            extensions = input.userOptions.data.extension,
            re = new RegExp( '\\.'+ extensions.join('|') +'$', 'i' ),
            valid = false
        for ( var i = 0, len = files.length; i < len; i++ ) {
          valid = re.test( files[i].name );
        }
        this.error = $.idealforms.errors.extension.replace( '{0}', extensions.join('", "') )
        return valid
      }
    },

    ajax: {
      regex: function( input, value, showOrHideError ) {

        var self = this
        var $input = input.input
        var userOptions = input.userOptions
        var name = $input.attr('name')
        var $field = $input.parents('.ideal-field')
        var valid = false

        var customErrors = userOptions.errors && userOptions.errors.ajax
        self.error = {}
        self.error.success = customErrors && customErrors.success
          ? customErrors.success
          : $.idealforms.errors.ajaxSuccess.replace( '{0}', value )
        self.error.fail = customErrors && customErrors.error
          ? customErrors.error
          : $.idealforms.errors.ajaxError

        // Send input name as $_POST[name]
        var data = {}
        data[ name ] = $.trim( value )

        // Ajax options defined by the user
        var userAjaxOps = input.userOptions.data.ajax

        var ajaxOps = {
          type: 'post',
          dataType: 'json',
          data: data,
          success: function( resp, text, xhr ) {
          console.log(resp)
            showOrHideError( self.error.success, true )
            $input.data({
              'ideal-ajax-resp': resp,
              'ideal-ajax-error': self.error.success
            })
            $input.trigger('change') // to update counter
            $field.removeClass('ajax')
            // Run custom success callback
            if( userAjaxOps._success ) {
              userAjaxOps._success( resp, text, xhr )
            }
          },
          error: function( xhr, text, error ) {
            if ( text !== 'abort' ) {
              showOrHideError( self.error.fail, false )
              $input.data( 'ideal-ajax-error', self.error.fail )
              $field.removeClass('ajax')
              // Run custom error callback
              if ( userAjaxOps._error ) {
                userAjaxOps._error( xhr, text, error )
              }
            }
          }
        }
        $.extend( ajaxOps, userAjaxOps )

        // Init
        $input.removeData('ideal-ajax-error')
        $input.removeData('ideal-ajax-resp')
        $field.addClass('ajax')

        // Run request and save it to be able to abort it
        // so requests don't bubble
        $.idealforms.ajaxRequests[ name ] = $.ajax( ajaxOps )
      }
    }

  }

  return filters

}
