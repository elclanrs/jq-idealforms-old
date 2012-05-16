/**
 * @namespace jq-idealforms jQuery plugin
 */
$.fn.idealforms = function (ops) {

  // Default options
  var o = $.extend({
    inputs: {},
    onSuccess: function (e) {
      alert('Thank you...')
    },
    onFail: function () {
      // What happens on submit if the form
      // does NOT validate.
      alert('The form does not validate! Check again...')
    },
    filters: {
      // Add your own filters
      // ie. myfilter: { regex: /something/, error: 'My error' }
    },
    responsiveAt: 'auto',
    customInputs: true
  }, ops)

  // Merge custom and default filters
  $.extend(true, Filters, o.filters)

/*--------------------------------------------------------------------------*/

  var $form = this,
      /**
       * @namespace All form inputs of the given form
       * @memberOf $.fn.idealforms
       * @returns {object}
       */
      FormInputs = (function () {
        var $inputs = $form.find('input, select, textarea, :button'),
            $labels = $form.find('label:first-child'),
            $text = $inputs.filter(':text, :password, textarea'),
            $select = $inputs.filter('select'),
            $radiocheck = $inputs.filter(':checkbox, :radio'),
            $buttons = $inputs.filter(':button')

        return {
          inputs: $inputs,
          labels: $labels,
          text: $text,
          select: $select,
          radiocheck: $radiocheck,
          buttons: $buttons
        }
      }())

/*--------------------------------------------------------------------------*/

  /**
  * @namespace Contains LESS data
  */
  var LessVars = {
    fieldWidth: Utils.getLessVar('ideal-field-width', 'width')
  }

/*--------------------------------------------------------------------------*/

  /**
   * @namespace Methods of the form
   * @memberOf $.fn.idealforms
   */
  var Actions = {

    /** Create validation elements and neccesary markup
     * @private
     */
    init: (function () {

      $form.css('visibility', 'visible').addClass('ideal-form')
      $form.children('div').addClass('ideal-wrap')

      // Add novalidate tag if HTML5.
      $form.attr('novalidate', 'novalidate')

      // Autocomplete causes some problems...
      FormInputs.inputs.attr('autocomplete', 'off')
      
      // Auto-adjust labels
      FormInputs.labels
        .addClass('ideal-label')
        .width(Utils.getMaxWidth(FormInputs.labels))
      
      // Generate necessary markup
      ;(function generateMarkup () {
      
        // Icons and error elements
        var $error = $('<span class="error" />'),
            $valid = $('<i class="icon valid-icon" />'),
            $invalid = $('<i/>', {
              'class': 'icon invalid-icon',
              click: function () {
                var $this = $(this)
                if ($this.siblings('label').length) { // radio & check
                  $this.siblings('label:first').find('input').focus()
                } else {
                  $this.siblings('input, select, textarea').focus()
                }
              }
            })
            
        // Text inputs & select markup
        FormInputs.text
          .add(FormInputs.select)
          .each(function () {
            var $this = $(this)
            $this.wrapAll('<span class="ideal-field"/>')
          })
        
        // Radio & Checkbox markup
        FormInputs.radiocheck
          .parents('.ideal-wrap')
          .each(function () {
            $(this)
              .find('label:not(.ideal-label)')
              .wrapAll('<span class="ideal-field ideal-radiocheck"/>')      
          })
        
        // Insert icons and error in DOM
        $form.find('.ideal-field')
          .append($valid.add($invalid))
          .after($error)
          
      }())

      // Custom inputs
      if (o.customInputs) {
        FormInputs.buttons.addClass('ideal-button')
        FormInputs.select.addClass('custom').toCustomSelect()
        FormInputs.radiocheck.addClass('custom').toCustomRadioCheck()
      }

      // Placeholder support
      if (!('placeholder' in $('<input/>')[0])) {
        FormInputs.text.each(function () {
          $(this).val($(this).attr('placeholder'))
        }).on({
          focus: function () {
            if (this.value === $(this).attr('placeholder')) $(this).val('')
          },
          blur: function () {
            $(this).val() || $(this).val($(this).attr('placeholder'))
          }
        })
      }
    }()),

    /** Validates an input
     * @memberOf Actions
     * @param {object} input Object that contains the jQuery input object [input.input]
     * and the user options of that input [input.userOptions]
     * @param {string} value The value of the given input
     * @returns {object} Returns [isValid] plus [error] if it fails
     */
    validate: function (input, value) {
      var isValid = true,
          error = '',
          userOptions = input.userOptions,
          userFilters

      if (userOptions.filters) {
        userFilters = userOptions.filters
        if (!value && /required/.test(userFilters)) {
          if (userOptions.errors && userOptions.errors.required) {
            error = userOptions.errors.required
          } else {
            error = 'This field is required.'
          }
          isValid = false
        }
        if (value) {
          userFilters = userFilters.split(/\s/)
          $.each(userFilters, function (i, uf) {
            var theFilter = Filters[uf]
            if (theFilter) {
              if (
                typeof theFilter.regex === 'function' && !theFilter.regex(input, value) ||
                theFilter.regex instanceof RegExp && !theFilter.regex.test(value)
              ) {
                isValid = false
                error = (userOptions.errors && userOptions.errors[uf]) || theFilter.error
                return false
              }
            }
          })
        }
      } else {
        isValid = true
      }
      return {
        isValid: isValid,
        error: error
      }
    },

    /** Shows or hides validation errors and icons
     * @memberOf Actions
     * @param {object} input jQuery object
     * @param {string} evt The event on which `analyze()` is being called
     */
    analyze: function (input, evt) {

      var $input = FormInputs.inputs.filter('[name="' + input.attr('name') + '"]'),
          userOptions = o.inputs[input.attr('name')] || '',
          value = (function () {
            var iVal = input.val()
            if (iVal === input.attr('placeholder')) {
              return
            }
            // IE8 and IE9 fix empty value bug
            if (input.is(':checkbox, :radio')) {
              return userOptions && ' '
            }
            return iVal
          }())

      // Validate
      var test = Actions.validate({
        input: $input,
        userOptions: userOptions
      }, value)

      /**
       * @namespace Validation elements
       */
      var $field = input.parents('.ideal-field'),
          $error = $field.next('.error'),
          $invalid = (function () {
            if ($input.is(':checkbox, :radio')) {
              return input.parent().siblings('.invalid-icon')
            }
            return input.siblings('.invalid-icon')
          }()),
          $valid = (function () {
            if ($input.is(':checkbox, :radio')) {
              return input.parent().siblings('.valid-icon')
            }
            return input.siblings('.valid-icon')
          }())

      // Reset
      $field.removeClass('valid invalid')
      $error.add($invalid).add($valid).hide()

      // Validates
      if (value && test.isValid) {
        $error.add($invalid).hide()
        $field.addClass('valid')
        $valid.show()
      }
      // Does NOT validate
      if (!test.isValid) {
        $invalid.show()
        $field.addClass('invalid')
        // hide error on blur
        if (evt !== 'blur') $error.html(test.error).show()
      }
    },

    /** Deals with responsiveness aka adaptation
     * @memberOf Actions
     */
    responsive: function () {

      var maxWidth = LessVars.fieldWidth + FormInputs.labels.outerWidth()

      if (o.responsiveAt === 'auto') {
        $form.width() < maxWidth
          ? $form.addClass('stack')
          : $form.removeClass('stack')
      } else {
        $(window).width() < o.responsiveAt
          ? $form.addClass('stack')
          : $form.removeClass('stack')
      }

      // Labels
      var $emptyLabel = FormInputs.labels.filter(function () {
        return $(this).html() === '&nbsp;'
      })
      $form.is('.stack') ? $emptyLabel.hide() : $emptyLabel.show()

      // Custom select
      var $customSelect = FormInputs.select.next('.ideal-select')
      $form.is('.stack')
        ? $customSelect.trigger('list')
        : $customSelect.trigger('menu')
    }
  }

/*--------------------------------------------------------------------------*/

  /** Attach events to the form **/

  FormInputs.inputs
    .on('keyup change focus blur', function (e) {
      Actions.analyze($(this), e.type)
    })
    .blur() // Start fresh

  $form.submit(function (e) {
    if ($form.find('.ideal-field.invalid').length) {
      e.preventDefault()
      o.onFail()
    } else {
      o.onSuccess()
    }
  })

  // Responsive
  if (o.responsiveAt) {
    $(window).resize(function () {
      Actions.responsive()
    })
    Actions.responsive()
  }

  return this

}