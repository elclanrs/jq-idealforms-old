/**
 * @namespace jq-idealforms jQuery plugin
 */

$.fn.idealforms = function (ops) {

  var

  $form = this, // The form

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
      alert($form.getInvalid().length +' invalid fields.')
    },
    responsiveAt: 'auto',
    customInputs: true
  }, ops),

  /** Generate tabs from fieldsets
   * @returns tabs plugin object with methods
   */
  $idealTabs = (function () {
    var $t = false,
        $tabs = $form.find('section')
    if ($tabs.length) {
      $form.prepend('<div class="ideal-wrap ideal-tabs ideal-full-width"/>')
      $t = $tabs.tabs({
        tabContainer: '.ideal-tabs'
      })
    }
    return $t
  }()),

  Filters = getFilters(), // Get filters with localized errors

  /**
   * @namespace All form inputs of the given form
   * @memberOf $.fn.idealforms
   * @returns {object}
   */
  getFormInputs = function () {
    return {
      inputs: $form.find('input, select, textarea, :button'),
      labels: $form.find('div > label:first-child'),
      text: $form.find('input:not([type="checkbox"], [type="radio"]), textarea'),
      select: $form.find('select'),
      radiocheck: $form.find('input[type="radio"], input[type="checkbox"]'),
      buttons: $form.find(':button'),
      file: $form.find('input[type="file"]'),
      headings: $form.find('h1, h2, h3, h4, h5, h6, p'),
      separators: $form.find('hr')
    }
  },

  /**
   * All inputs specified by the user
   */
  getUserInputs = function () {
    return $(
      '[name="'+ Utils.getKeys(o.inputs).join('"], [name="') +'"],' + // by name attribute
      '.' + Utils.getKeys(Filters).join(', .') // by class
    )
  },

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

    getCurrentTab: function ($input) {
      var $tabContent = $input.parents('.ideal-tabs-content'),
          tabName = $tabContent.data('ideal-tabs-content-name'),
          $fields = $(
            $tabContent
              .find('.ideal-field')
              .parents('.ideal-wrap')
              .get().reverse() // correct order
            )
      return {
        content: $tabContent,
        name: tabName,
        fields: $fields
      }
    },

    getTab: function (tabName) {
      return $idealTabs.filter(function () {
          var re = new RegExp(tabName, 'i')
          return re.test($(this).data('ideal-tabs-content-name'))
        })
    },

    /**
     * Generate markup for any given
     * Ideal Forms element type
     * @memberOf Actions
     */
    doMarkup: function ($el) {

      var

      type = Utils.getIdealType($el),

      // Append errors and icons
      addValidationEls = function () {
        // Validation elements
        var
        $error = $('<span class="error" />'),
        $valid = $('<i class="icon valid-icon" />'),
        $invalid = $('<i/>', {
          'class': 'icon invalid-icon',
          click: function () {
            var $this = $(this)
            if ($this.siblings('label').length) // radio & check
              $this.siblings('label:first').find('input').focus()
            else $this.siblings('input, select, textarea').focus()
          }
        })
        $el.parents('.ideal-field')
          .append($valid.add($invalid).hide())
          .after($error.hide())
      },

      // Ideal Types
      idealTypes = {
        'default': $.noop,
        defaultInput: function () {
          $el.wrapAll('<span class="ideal-field"/>')
          addValidationEls()
        },
        button: function () {
          if (o.customInputs) $el.addClass('ideal-button')
        },
        file: function () {
          idealTypes.defaultInput()
          if (o.customInputs) $el.toCustomFile()
        },
        select: function () {
          idealTypes.defaultInput()
          if (o.customInputs) $el.toCustomSelect()
        },
        text: function () {
          idealTypes.defaultInput()
        },
        radiocheck: function () {
          var isWrapped = $el.parents('.ideal-field').length,
              $all = $el.parent().siblings('label:not(:first)').andSelf()
          if (o.customInputs) $el.toCustomRadioCheck()
          if (!isWrapped) {
            $all.wrapAll('<span class="ideal-field ideal-radiocheck"/>')
            addValidationEls()
          } else {
            return false
          }
        },
        description: function () {
          var isWrapped = $el.parents('.ideal-field').length,
              $all = $el.siblings().andSelf()
          $el.closest('div').addClass('ideal-full-width')
          if (!isWrapped)
            $all.wrapAll('<span class="ideal-heading"/>')
        },
        separator: function () {
          $el.closest('div').addClass('ideal-full-width')
          $el.wrapAll('<div class="ideal-separator"/>')
        }
      }

      // Wrapper
      $el.closest('div').addClass('ideal-wrap')

      idealTypes[type]
        ? idealTypes[type]()
        : idealTypes['default']()

    },

    /**
     * Adjust form
     * @memberOf Actions
     */
    adjust: function () {
      var formInputs = getFormInputs(),
          userInputs = getUserInputs()

      // Autocomplete causes some problems...
      formInputs.inputs.attr('autocomplete', 'off')

      // Add filter classes to inputs
      // specified by name in the plugin
      $('[name="'+ Utils.getKeys(o.inputs).join('"], [name="') +'"]')
        .each(function(){ this.className = o.inputs[this.name].filters })

      // Adjust labels
      formInputs.labels
        .addClass('ideal-label')
        .width(Utils.getMaxWidth(formInputs.labels))

      // Adjust headings, separators
      if ($idealTabs.length) {
        $idealTabs.each(function(){
          $(this).find('.ideal-heading:first')
            .addClass('first-child')
        })
      } else {
        $form.find('.ideal-heading:first')
          .addClass('first-child')
      }

      // Datepicker
      if (jQuery.ui) {
        $form.find('input.date').each(function(){
          var
          userInput = o.inputs[this.name],
          data = userInput.data && userInput.data.date,
          format = data ? data.replace('yyyy', 'yy') : 'mm/dd/yy'

          $(this).datepicker({
            dateFormat: format,
            beforeShow: function (i) { $(i).addClass('open') },
            onChangeMonthYear: function () {
              // Hack to fix IE9 not resizing
              var w = $(this).outerWidth() // cache first!
              setTimeout(function(){
                $(this).datepicker('widget').width(w)
              }, 1)
            },
            onClose: function () { $(this).removeClass('open') }
          })
        })
        .on('focus keyup', function(){
          var t = $(this), w = t.outerWidth()
          t.datepicker('widget').width(w)
        })
        .parent().siblings('.error').addClass('hidden')
      }

      // Placeholder support
      if (!('placeholder' in $('<input/>')[0])) {
        formInputs.text.each(function () {
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
    },

    /**
     * Initializate form
     * @memberOf Actions
     */
    init: function () {
      var formInputs = getFormInputs()
      $form.css('visibility', 'visible').addClass('ideal-form')

      // Add novalidate tag if HTML5.
      $form.attr('novalidate', 'novalidate')

      // Alway show datepicker below the input
      if (jQuery.ui) {
        $.datepicker._checkOffset = function(a, b, c) { return b }
      }

      // Do markup
      formInputs.inputs
        .add(formInputs.headings)
        .add(formInputs.separators)
        .each(function(){
          Actions.doMarkup($(this))
        })
      Actions.adjust()
    },

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
              : Filters.required.error
          )
          isValid = false
        }

        // All other filters
        if (value) {
          userFilters = userFilters.split(/\s/)
          for (var i = 0, len = userFilters.length; i < len; i++) {
            var uf = userFilters[i],
                theFilter = Filters[uf] || {}
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

      isRadiocheck = input.is('[type="checkbox"], [type="radio"]'),

      $input = (function(){
        var userInputs = getUserInputs()
        if (isRadiocheck)
          return userInputs.filter('[name="' + input.attr('name') + '"]')
        return userInputs.filter(input)
      }()),

      currentTabName = Actions.getCurrentTab($input).name,

      userOptions = (
        o.inputs[input.attr('name')] || // by name attribute
        { filters: input.attr('class') } // by class
      ),
      value = (function () {
        var iVal = input.val()
        if (iVal === input.attr('placeholder')) return
        // Always send a value when validating
        // [type="checkbox"] and [type="radio"]
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
      },
      value),

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
        // error
        $form.find('.error').hide()
        if (evt !== 'blur') // hide on blur
          $error.html(test.error).show()
      }

      // Update tabs counter
      if ($idealTabs.length)
        $idealTabs.updateCounter(
          currentTabName,
          $form.getInvalid(currentTabName).length
        )

      doFlags()
    },

    /**
     * Attach all validation events to specified user inputs
     * @memberOf Actions
     */
    attachEvents: function () {
      getUserInputs()
        .on('keyup change focus blur', function (e) {
          Actions.analyze($(this), e.type)
        })
    },

    /** Deals with responsiveness aka adaptation
     * @memberOf Actions
     */
    responsive: function () {

      var

      formInputs = getFormInputs(),

      maxWidth = LessVars.fieldWidth + formInputs.labels.outerWidth(),
      $emptyLabel = formInputs.labels.filter(function () {
        return $(this).html() === '&nbsp;'
      }),
      $customSelect = $form.find('.ideal-select'),
      $datePicker = $form.find('input.hasDatepicker')

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

      // Hide datePicker
      if ($datePicker.length) $datePicker.datepicker('hide')

    }
  },

/*-------------------------------------------------------------------------*/

  /**
  * @namespace Public methods
  */
  PublicMethods = {

    /**
     * Add fields to the form dynamically
     * @param fields Array of objects
     */
    addFields: function (fields) {

      // Reverse array to insert in DOM
      // in proper order
      fields = fields.reverse()

      var add = function (ops) {

        var

        name = ops.name,

        // User options
        userOptions = {
          filters: ops.filters || '',
          data: ops.data || {},
          errors: ops.errors || {},
          flags: ops.flags || ''
        },

        // Markup
        label = ops.label,
        type = ops.type,
        list = ops.list || '',
        placeholder = ops.placeholder || '',
        $field = $(
          '<div>'+
            '<label>'+ label +':</label>'+ Utils.makeInput(name, type, list, placeholder) +
          '</div>'
        ),
        $input = $field.find('input, select, textarea, :button')

        // Add user options
        if (userOptions.filters) o.inputs[name] = userOptions

        Actions.doMarkup($input)

        // Insert in DOM
        if (ops.addAfter)
          $field.insertAfter(
            $(Utils.getByNameOrId(ops.addAfter)).parents('.ideal-wrap')
          )
        else if (ops.addBefore)
          $field.insertBefore(
            $(Utils.getByNameOrId(ops.addBefore)).parents('.ideal-wrap')
          )
        else if (ops.appendToTab)
          $field.insertAfter(
            Actions.getTab(ops.appendToTab).find('.ideal-wrap:last-child')
          )
        else
          $field.insertAfter($form.find('.ideal-wrap').last())
      }

      // Run through each input
      for (var i = 0, len = fields.length; i < len; i++)
        add(fields[i])

      // Reload form
      $form.reload()

      return $form
    },

    /**
     * Remove fields dynamically
     * @param fields Array of objects
     */
    removeFields: function (fields) {
      var f = []
      for (var i = 0, l = fields.length; i < l; i++)
        f.push( Utils.getByNameOrId(fields[i]).get(0) )
      $(f).parents('.ideal-wrap').remove()
      return $form
    },

    getInvalid: function (tabName) {
      if (tabName && $idealTabs.length) {
        return Actions.getTab(tabName)
          .find('.ideal-field').filter(function () {
            return $(this).data('isValid') === false
          })
      }
      return $form.find('.ideal-field').filter(function () {
          return $(this).data('isValid') === false
        })
    },

    isValid: function () {
      return !$form.getInvalid().length
    },

    isValidField: function (str) {
      var $input = Utils.getByNameOrId(str)
      return $input.parents('.ideal-field').data('isValid') === true
    },

    focusFirst: function () {
      if ($idealTabs.length)
        $idealTabs.filter(':visible')
          .find('input:first').focus()
      else
        $form.find('input:first').focus()
      return $form
    },

    focusFirstInvalid: function () {
      var $first = $form.getInvalid().first(),
          tabName =
            $first.parents('.ideal-tabs-content')
              .data('ideal-tabs-content-name')
      if ($idealTabs.length)
        $idealTabs.switchTab({ name: tabName })
      $first.find('input:first').focus()
      return $form
    },

    switchTab: function (name, idx) {
      $idealTabs.switchTab({ name: name, idx: idx })
      return $form
    },

    nextTab: function () {
      $idealTabs.nextTab()
      return $form
    },

    prevTab: function () {
      $idealTabs.prevTab()
      return $form
    },

    firstTab: function () {
      $idealTabs.firstTab()
      return $form
    },

    lastTab: function () {
      $idealTabs.lastTab()
      return $form
    },

    fresh: function () {
      var userInputs = getUserInputs()
      userInputs
        .blur()
        .parents('.ideal-field')
        .removeClass('valid invalid')
      if ($idealTabs.length)
        $idealTabs.firstTab()
      return $form
    },

    reload: function () {
      Actions.adjust()
      Actions.attachEvents()
    },

    reset: function (name) {
      var formInputs = getFormInputs(),
          $input, type
      if (name) {
        $input = Utils.getByNameOrId(name)
        type = Utils.getIdealType($input)
        if (type === 'text' || type === 'file')
          $input.val('')
        if (type === 'radiocheck')
          $input.removeAttr('checked') // radio & check
        if (type === 'select') {
          $input.find('option').first().prop('selected', true)
          $input.next('.ideal-select').trigger('reset')
        }
        $input.change().blur()
      }
      else {
        formInputs.text.val('') // text inputs
        formInputs.radiocheck.removeAttr('checked') // radio & check
        // Select and custom select
        formInputs.select.find('option').first().prop('selected', true)
        $form.find('.ideal-select').trigger('reset')
        // Reset all
        formInputs.inputs.change().blur()
        $form.focusFirst()
      }
      return $form
    },

    submitData: function () {
      $form.submit()
      return $form
    }
  }

/*--------------------------------------------------------------------------*/

  // attach public methods
  for (var m in PublicMethods) $form[m] = PublicMethods[m]

  $form.on({
    keydown: function (e) {
      // Prevent submit when pressing enter
      if (e.which === 13) e.preventDefault()
    },
    submit: function (e) {
      if (!$form.isValid()) {
        e.preventDefault()
        o.onFail()
        $form.focusFirstInvalid()
      }
      else o.onSuccess(e)
    }
  })

  // Merge custom and default filters
  $.extend(true, Filters, o.customFilters)

  // Merge custom and default flags
  $.extend(true, Flags, o.customFlags)

  // Start form
  Actions.init()
  Actions.attachEvents()
  $form.fresh()

  // Responsive
  if (o.responsiveAt) {
    $(window).resize(Actions.responsive)
    Actions.responsive()
  }

  return this

}
