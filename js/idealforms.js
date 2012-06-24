/**
 * @namespace jq-idealforms jQuery plugin
 */
$.fn.idealforms = function (ops) {

  var

  // Default options
  o = $.extend({
    inputs: {},
    customFilters: {},
    customFlags: {},
    globalFlags: '',
    onSuccess: function (e) {
      alert('Thank you...')
    },
    onFail: function () {
      alert('The form does not validate! Check again...')
    },
    responsiveAt: 'auto',
    customInputs: true
  }, ops),

  $form = this, // The form

  /**
   * @namespace All form inputs of the given form
   * @memberOf $.fn.idealforms
   * @returns {object}
   */
  FormInputs = {
    inputs: $form.find('input, select, textarea, :button'),
    labels: $form.find('label:first-child'),
    text: $form.find('input:not(:checkbox, :radio), textarea'),
    select: $form.find('select'),
    radiocheck: $form.find('input:radio, input:checkbox'),
    buttons: $form.find(':button'),
    file: $form.find(':file')
  },
  /**
   * All inputs specified by the user
   */
  UserInputs = $(
    '[name="'+ Utils.getKeys(o.inputs).join('"], [name="') +'"],' + // by name attribute
    '.' + Utils.getKeys(Filters).join(', .') // by class
  ),

/*--------------------------------------------------------------------------*/

  /**
  * @namespace Contains LESS data
  */
  LessVars = {
    fieldWidth: Utils.getLessVar('ideal-field-width', 'width')
  },

/*--------------------------------------------------------------------------*/

  /**
   * @namespace Methods of the form
   * @memberOf $.fn.idealforms
   */
  Actions = {

    /** Create validation elements and neccesary markup
     * @private
     */
    init: (function () {

      var $error = $('<span class="error" />'),
          $valid = $('<i class="icon valid-icon" />'),
          $invalid = $('<i/>', {
            'class': 'icon invalid-icon',
            click: function () {
              var $this = $(this)
              if ($this.siblings('label').length) { // radio & check
                $this.siblings('label:first').find('input').focus()
              }
              else $this.siblings('input, select, textarea').focus()
            }
          })

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
      // only for specified user inputs
      UserInputs.parents('.ideal-field')
        .append($valid.add($invalid))
        .after($error.hide())

      // Custom inputs
      if (o.customInputs) {
        FormInputs.buttons.addClass('ideal-button')
        FormInputs.select.toCustomSelect()
        FormInputs.radiocheck.toCustomRadioCheck()
        FormInputs.file.toCustomFile()
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
          $input = input.input,
          userOptions = input.userOptions,
          userFilters = userOptions.filters

      if (userFilters) {

        // Required
        if (!value && /required/.test(userFilters)) {
          error = (
            userOptions.errors && userOptions.errors.required
              ? userOptions.errors.required
              : 'This field is required.'
          )
          isValid = false
        }

        // All other filters
        if (value) {
          userFilters = userFilters.split(/\s/)
          for (var i = 0, len = userFilters.length; i < len; i++) {
            var uf = userFilters[i],
                theFilter = Filters[uf] || ''
            if (
              theFilter && (
                Utils.isFunction(theFilter.regex) && !theFilter.regex(input, value) ||
                Utils.isRegex(theFilter.regex) && !theFilter.regex.test(value)
              )
            ) {
              isValid = false
              error = (
                userOptions.errors && userOptions.errors[uf] ||
                theFilter.error
              )
              break
            }
          }
        }

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

      var

      isRadiocheck = input.is(':checkbox, :radio'),
      $input = (function(){
        if (isRadiocheck)
          return UserInputs.filter('[name="' + input.attr('name') + '"]')
        return UserInputs.filter(input)
      }()),
      userOptions = (
        o.inputs[input.attr('name')] || // by name attribute
        { filters: input.attr('class') } // by class
      ),
      value = (function () {
        var iVal = input.val()
        if (iVal === input.attr('placeholder')) return
        // Always send a value when validating
        // :checkbox and :radio
        if (isRadiocheck) return userOptions && ' '
        return iVal
      }()),

      $field = input.parents('.ideal-field'),
      $error = $field.next('.error'),
      $invalid = (function () {
        if (isRadiocheck) return input.parent().siblings('.invalid-icon')
        return input.siblings('.invalid-icon')
      }()),
      $valid = (function () {
        if (isRadiocheck) return input.parent().siblings('.valid-icon')
        return input.siblings('.valid-icon')
      }()),

      // Validate
      test = Actions.validate({
        input: $input,
        userOptions: userOptions
      }, value),

      // Flags
      flags = (function(){
        // Input flags
        var f = userOptions.flags ? userOptions.flags : ''
        // Append global flags
        if (o.globalFlags) f += o.globalFlags
        return f.split(/\s/)
      }()),
      doFlags = function () {
        for (var i = 0, len = flags.length, f; i < len; i++) {
          f = flags[i]
          if (Flags[f]) Flags[f]($input, evt)
          else break
        }
      }

      // Reset
      $field.removeClass('valid invalid').data('isValid', true)
      $error.add($invalid).add($valid).hide()

      // Validates
      if (value && test.isValid) {
        $error.add($invalid).hide()
        $field.addClass('valid').data('isValid', true)
        $valid.show()
      }
      // Does NOT validate
      if (!test.isValid) {
        $invalid.show()
        $field.addClass('invalid').data('isValid', false)
        // hide error on blur
        if (evt !== 'blur') $error.html(test.error).show()
      }

      doFlags()
    },

    /** Deals with responsiveness aka adaptation
     * @memberOf Actions
     */
    responsive: function () {

      var

      maxWidth = LessVars.fieldWidth + FormInputs.labels.outerWidth(),
      $emptyLabel = FormInputs.labels.filter(function () {
        return $(this).html() === '&nbsp;'
      }),
      $customSelect = FormInputs.select.next('.ideal-select')

      if (o.responsiveAt === 'auto') {
        $form.width() < maxWidth
          ? $form.addClass('stack')
          : $form.removeClass('stack')
      } else {
        $(window).width() < o.responsiveAt
          ? $form.addClass('stack')
          : $form.removeClass('stack')
      }

      if ($form.is('.stack')) {
        $emptyLabel.hide()
        $customSelect.trigger('list')
      } else {
        $emptyLabel.show()
        $customSelect.trigger('menu')
      }

    }
  },

/*--------------------------------------------------------------------------*/

  /**
  * @namespace Public methods
  */
  PublicMethods = {
    getInvalid: function () {
      return $form.find('.ideal-field').filter(function () {
          return $(this).data('isValid') === false
        })
    },
    isValid: function () {
      return !$form.getInvalid().length
    },
    isValidField: function (name) {
      var $input =
        $('[name="'+ name +'"]').length
          ? $('[name="'+ name +'"]')
          : $('#' + name)
      return $input.parents('.ideal-field').data('isValid') === false
    },
    focusFirst: function () {
      $form.find('input:first').focus();
      return $form
    },
    focusFirstInvalid: function () {
      $form
        .getInvalid()
        .first()
        .find('input:first')
        .focus()
      return $form
    },
    fresh: function () {
      UserInputs
        .blur()
        .parents('.ideal-field')
        .removeClass('valid invalid')
      return $form
    },
    reset: function () {
      FormInputs.text.val('') // text inputs
      FormInputs.radiocheck.removeAttr('checked') // :radio & :checkbox
      // Select and custom select
      FormInputs.select.find('option').first().prop('selected', true)
      $form.find('.ideal-select').trigger('reset')
      // Reset all
      FormInputs.inputs.change().blur()
      $form.focusFirst()
      return $form
    }
  }

/*--------------------------------------------------------------------------*/

  // attach public methods
  for (var m in PublicMethods) $form[m] = PublicMethods[m]

  // Attach events
  UserInputs
    .on('keyup change focus blur', function (e) {
      Actions.analyze($(this), e.type)
    })

  $form.fresh()

  $form.on({
    keydown: function (e) {
      // Prevent submit when pressing enter
      if (e.which === 13) e.preventDefault()
    }
    submit: function (e) {
      if (!$form.isValid()) {
        e.preventDefault()
        o.onFail()
        $form.focusFirstInvalid()
      }
      else o.onSuccess(e)
    }
  })

  // Responsive
  if (o.responsiveAt) {
    $(window).resize(Actions.responsive)
    Actions.responsive()
  }

  // Merge custom and default filters
  $.extend(true, Filters, o.customFilters)

  // Merge custom and default flags
  $.extend(true, Flags, o.customFlags)

  return this

}
