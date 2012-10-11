/**
 * @namespace jq-idealforms jQuery plugin
 */

$.fn.idealforms = function(ops) {

  var $form = this;
  var formId = Utils.getObjSize($.idealforms.forms); // unique id
  var formRef = $.idealforms.forms[formId] = {}; // reference to this form

  // Options
  var options = {
    inputs: {},
    customFilters: {},
    customFlags: {},
    globalFlags: '',
    onSuccess: function (e) { alert('Thank you...') },
    onFail: function () { alert($form.getInvalid().length +' invalid fields.') },
    responsiveAt: 'auto',
    disableCustom: ''
  }

  var o = formRef.options = $.extend({}, options, ops)

  $.extend($.idealforms.filters, getFilters()) // Get filters with localized errors

  /** Generate tabs from sections
   * @returns tabs plugin object with methods
   */
  var $idealTabs = (function () {
    var $tabs = $form.find('section')
    if ($tabs.length) {
      var uniq = 'ideal-tabs-form-'+ formId
      $form.prepend('<div class="'+ uniq +' ideal-wrap ideal-tabs ideal-full-width"/>')
      $tabs.idealTabs({ tabContainer: '.'+ uniq })
    }
    return $tabs.length ? $tabs : false
  }())

  /**
   * @namespace All form inputs of the given form
   * @memberOf $.fn.idealforms
   * @returns {object}
   */
  var getFormInputs = function () {
    return {
      inputs: $form.find('input, select, textarea, :button'),
      labels: $form.find('div > label:first-child'),
      text: $form.find('input:not([type="checkbox"], [type="radio"], [type="submit"]), textarea'),
      select: $form.find('select'),
      radiocheck: $form.find('input[type="radio"], input[type="checkbox"]'),
      buttons: $form.find(':button'),
      file: $form.find('input[type="file"]'),
      headings: $form.find('h1, h2, h3, h4, h5, h6, p'),
      separators: $form.find('hr'),
      hidden: $form.find('input:hidden')
    }
  }

  /**
   * All inputs specified by the user
   */
  var getUserInputs = function () {
    return $form.find('[name="'+ Utils.getKeys(o.inputs).join('"], [name="') +'"]')
  }

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

    getCurrentTabName: function ($input) {
      return $input.parents('.ideal-tabs-content')
        .data('ideal-tabs-content-name')
    },

    getTab: function (tabName) {
      return $idealTabs.filter(function () {
          var re = new RegExp(tabName, 'i')
          return re.test($(this).data('ideal-tabs-content-name'))
        })
    },

    // Update tabs counter
    updateTabsCounter: function (tabName) {
      var invalid
      if (tabName) {
        invalid = $form.getInvalidInTab(tabName).length
        $idealTabs.updateCounter(tabName, invalid)
      }
      else {
        $idealTabs.each(function () {
          tabName = $(this).data('ideal-tabs-content-name')
          invalid = $form.getInvalid(name).length
          $idealTabs.updateCounter(tabName, invalid)
        })
      }
    },

    /**
     * Generate markup for any given
     * Ideal Forms element type
     * @memberOf Actions
     */
    doMarkup: function ($el) {

      // Validation elements
      function addValidationEls() {
        var $error = $('<span class="ideal-error" />')
        var $valid = $('<i class="ideal-icon ideal-icon-valid" />')
        var $invalid = $('<i/>', {
          'class': 'ideal-icon ideal-icon-invalid',
          click: function () {
            var $this = $(this)
            $this.siblings('label').length // is radiocheck?
              ? $this.siblings('label:first').find('input').focus()
              : $this.siblings('input, select, textarea').focus()
          }
        })
        $el.parents('.ideal-field')
          .append($valid.add($invalid).hide())
          .after($error.hide())
      }

      var type = Utils.getIdealType($el)

      // Ideal Types
      var idealTypes = {

        _default: $.noop,

        defaultInput: function () {
          $el.wrapAll('<span class="ideal-field"/>')
          addValidationEls()
        },
        button: function () {
          if (!/button/.test(o.disableCustom)) {
            $el.addClass('ideal-button')
          }
        },
        file: function () {
          idealTypes.defaultInput()
          if (!/file/.test(o.disableCustom)) {
            $el.idealFile()
          }
        },
        select: function () {
          idealTypes.defaultInput()
          if (!/select/.test(o.disableCustom)) {
            $el.idealSelect()
          }
        },
        text: function () {
          idealTypes.defaultInput()
        },
        radiocheck: function () {
          var isWrapped = $el.parents('.ideal-field').length,
              $all = $el.parent().siblings('label:not(:first-child)').andSelf()
          if (!/radiocheck/.test(o.disableCustom)) {
            $el.idealRadioCheck()
          }
          if (!isWrapped) {
            $all.wrapAll('<span class="ideal-field ideal-radiocheck"/>')
            addValidationEls()
          } else {
            return false
          }
        },
        description: function () {
          $el.closest('div')
            .addClass('ideal-full-width')
            .children()
            .wrapAll('<span class="ideal-heading"/>')
        },
        separator: function () {
          $el.closest('div').addClass('ideal-full-width')
          $el.wrapAll('<div class="ideal-separator"/>')
        },
        hidden: function () {
          $el.closest('div').addClass('ideal-hidden')
        }
      }

      // Wrapper
      $el.closest('div').addClass('ideal-wrap')

      idealTypes[type] ? idealTypes[type]() : idealTypes._default()

    },

    /**
     * Adjust form
     * @memberOf Actions
     */
    adjust: function () {

      var formInputs = getFormInputs()
      var userInputs = getUserInputs()

      // Autocomplete causes some problems...
      formInputs.inputs.attr('autocomplete', 'off')

      // Adjust labels
      formInputs.labels
        .removeAttr('style')
        .addClass('ideal-label')
        .width(Utils.getMaxWidth(formInputs.labels))

      // Adjust headings, separators
      if ($idealTabs) {
        $idealTabs.each(function(){
          $(this).find('.ideal-heading:first').addClass('first-child')
        })
      } else {
        $form.find('.ideal-heading:first').addClass('first-child')
      }

      // Datepicker
      var $datepicker = $form.find('input.datepicker')
      if (jQuery.ui && $datepicker.length) {

        $datepicker.each(function(){

          var userInput = o.inputs[this.name]
          var data = userInput && userInput.data && userInput.data.date
          var format = data ? data.replace('yyyy', 'yy') : 'mm/dd/yy'

          $(this).datepicker({
            dateFormat: format,
            beforeShow: function (input) {
              $(input).addClass('open')
            },
            onChangeMonthYear: function () {
              // Hack to fix IE9 not resizing
              var w = $(this).outerWidth() // cache first!
              setTimeout(function(){
                $(this).datepicker('widget').css('width', w)
              }, 1)
            },
            onClose: function () { $(this).removeClass('open') }
          })
        })

        // Adjust width
        $datepicker.on('focus keyup', function() {
          var t = $(this), w = t.outerWidth()
          t.datepicker('widget').css('width', w)
        })

        $datepicker.parent().siblings('.ideal-error').addClass('hidden')
      }

    },

    /**
     * Initialize form
     * @memberOf Actions
     */
    init: function () {
      var formInputs = getFormInputs()

      $form.css('visibility', 'visible')
        .addClass('ideal-form')
        .attr('novalidate', 'novalidate') // disable HTML5 validation

      // Always show datepicker below the input
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

      // Add inputs specified by data-ideal
      // to the list of user inputs
      $form.find('[data-ideal]').each(function(){
        o.inputs[this.name] = { filters: $(this).data('ideal') }
      })

      Actions.adjust()
    },

    /** Validates an input and shows or hides error and icon
     * @memberOf Actions
     * @param {object} $input jQuery object
     * @param {string} e The JavaScript event
     */
    validate: function($input, e) {

      var userOptions = o.inputs[$input.attr('name')]
      var userFilters = userOptions.filters && userOptions.filters.split(' ')
      var name = $input.attr('name')
      var value = $input.val()

      var isRadioCheck = $input.is('[type="checkbox"], [type="radio"]')

      // Validation elements
      var $field = $input.parents('.ideal-field')
      var $error = $field.siblings('.ideal-error')
      var $invalid = isRadioCheck
        ? $input.parent().siblings('.ideal-icon-invalid')
        : $input.siblings('.ideal-icon-invalid')
      var $valid = isRadioCheck
        ? $input.parent().siblings('.ideal-icon-valid')
        : $input.siblings('.ideal-icon-valid')

      function resetError() {
        $field.removeClass('valid invalid').removeData('ideal-isvalid')
        $error.add($invalid).add($valid).hide()
      }

      function showOrHideError(error, valid) {
        resetError()
        valid ? $valid.show() : $invalid.show()
        $field.addClass(valid ? 'valid' : 'invalid')
        if (!valid) {
          $error.html(error).toggle($field.is('.ideal-field-focus'))
          $field.data('ideal-isvalid', false)
        }
      }

      // Prevent validation when typing but not introducing any new characters
      // This is mainly to prevent multiple AJAX requests
      var oldValue = $input.data('ideal-value') || 0
      $input.data('ideal-value', value)
      if (e.type === 'keyup' && value === oldValue) return false

      // Validate
      if (userFilters) {
        $.each(userFilters, function(i, filter) {

          var theFilter = $.idealforms.filters[filter]
          var customError = userOptions.errors && userOptions.errors[filter]
          var error = ''

          var inputData = {
            // If is radio or check validate all inputs related by name
            input: isRadioCheck ? $form.find('[name="' + name + '"]') : $input,
            userOptions: userOptions
          }

          // If field is empty and not required
          if (!value && filter !== 'required') {
            resetError()
            return false
          }

          // AJAX
          if (filter === 'ajax') {
            var ajaxRequest = $.idealforms.ajaxRequests[name]
            showOrHideError(error, false)
            if (e.type === 'keyup') {
              if (ajaxRequest) ajaxRequest.abort()
              theFilter.regex(inputData, value, showOrHideError) // Runs the ajax callback
              $error.hide()
            } else {
              showOrHideError($input.data('ideal-ajax-error'), $input.data('ideal-ajax-resp'))
            }
          }
          // All other filters
          else {
            var valid = Utils.isRegex(theFilter.regex) && theFilter.regex.test(value) ||
                        Utils.isFunction(theFilter.regex) && theFilter.regex(inputData, value)
            error = customError || theFilter.error // asign error after calling regex()
            showOrHideError(error, valid)
            if (!valid) return false
          }

        })
      }

      // Flags
      var flags = (function(){
        var f = userOptions.flags && userOptions.flags.split(' ') || []
        if (o.globalFlags) { $.each(o.globalFlags.split(), function(i,v) { f.push(v) }) }
        return f
      }())
      if (flags.length) {
        $.each(flags, function(i, f) {
          var theFlag = $.idealforms.flags[f]
          if (theFlag) { theFlag($input, e.type) }
        })
      }

      // Update counter
      if ($idealTabs) {
        Actions.updateTabsCounter(Actions.getCurrentTabName($input))
      }
    },

    attachEvents: function () {
      getUserInputs().on('keyup change focus blur', function (e) {
        var $this = $(this)
        var $field = $this.parents('.ideal-field')
        var isFile = $this.is('input[type=file]')
        // Trigger on change if type=file cuz custom file
        // disables focus on original input file (tabIndex = -1)
        if (e.type === 'focus' || isFile && e.type === 'change') { $field.addClass('ideal-field-focus') }
        if (e.type === 'blur') { $field.removeClass('ideal-field-focus') }
        Actions.validate($this, e)
      })
    },

    /** Deals with responsiveness aka adaptation
     * @memberOf Actions
     */
    responsive: function () {

      var formInputs = getFormInputs()
      var maxWidth = LessVars.fieldWidth + formInputs.labels.outerWidth()
      var $emptyLabel = formInputs.labels.filter(function () {
        return $(this).html() === '&nbsp;'
      })
      var $customSelect = $form.find('.ideal-select')

      o.responsiveAt === 'auto'
        ? $form.toggleClass('stack', $form.width() < maxWidth)
        : $form.toggleClass('stack', $(window).width() < o.responsiveAt)

      var isStack = $form.is('.stack')
      $emptyLabel.toggle(!isStack)
      $customSelect.trigger(isStack ? 'list' : 'menu')

      // Hide datePicker
      var $datePicker = $form.find('input.hasDatepicker')
      if ($datePicker.length) { $datePicker.datepicker('hide') }
    }
  }

/*-------------------------------------------------------------------------

  Public Methods:

-------------------------------------------------------------------------*/

  /**
  * Add fields to the form dynamically
  * @param fields Array of objects
  */
  $form.addFields = function (fields) {

    fields = Utils.convertToArray(fields)

    var
    // Save names of all inputs in array
    // to use methods that take names ie. fresh()
    allNames = [],

    // Add an input to the DOM
    add = function (ops) {

      var

      name = ops.name,

      userOptions = {
        filters: ops.filters || '',
        data: ops.data || {},
        errors: ops.errors || {},
        flags: ops.flags || ''
      },

      label = ops.label || '',
      type = ops.type,
      list = ops.list || [],
      placeholder = ops.placeholder || '',

      $field = $(
        '<div>'+
          '<label>'+ label +':</label>'+ Utils.makeInput(name, type, list, placeholder) +
        '</div>'
      ),
      $input = $field.find('input, select, textarea, :button')

      // Add inputs with filters to the list
      // of user inputs to validate
      if (userOptions.filters)
        o.inputs[name] = userOptions

      Actions.doMarkup($input)

      // Insert in DOM
      if (ops.addAfter) {
        $field.insertAfter(
          $(Utils.getByNameOrId(ops.addAfter)).parents('.ideal-wrap')
        )
      }
      else if (ops.addBefore) {
        $field.insertBefore(
          $(Utils.getByNameOrId(ops.addBefore))
          .parents('.ideal-wrap')
        )
      }
      else if (ops.appendToTab) {
        $field.insertAfter(
          Actions.getTab(ops.appendToTab)
          .find('.ideal-wrap:last-child')
        )
      }
      else {
        $field.insertAfter($form.find('.ideal-wrap').last())
      }

      // Add current field name to list of names
      allNames.push(name)
    }

    // Run through each input
    for (var i = 0, len = fields.length; i < len; i++)
      add(fields[i])

    // Reload form
    $form.reload()
    // Refresh field validation
    $form.freshFields(allNames)
    // responsiveness
    Actions.responsive()

    return $form
  }

  /**
  * Remove fields dynamically
  * @param fields Array of objects
  */
  $form.removeFields = function (fields) {
    fields = Utils.convertToArray(fields)
    var $fields = Utils.getFieldsFromArray(fields)
    $fields.parents('.ideal-wrap').remove()
    // counter
    if ($idealTabs) {
      Actions.updateTabsCounter()
    }
    $form.reload()
    return $form
  }

  $form.getInvalid = function () {
    return $form.find('.ideal-field').filter(function () {
      return $(this).data('ideal-isvalid') === false
    })
  }

  $form.getInvalidInTab = function (tabname) {
    return Actions.getTab(tabname)
      .find('.ideal-field').filter(function () {
        return $(this).data('ideal-isvalid') === false
      })
  }

  $form.isValid = function () {
    return !$form.getInvalid().length
  }

  $form.isValidField = function (str) {
    var $input = Utils.getByNameOrId(str)
    return $input.parents('.ideal-field').data('ideal-isvalid') === true
  }

  $form.focusFirst = function () {
    if ($idealTabs) {
      $idealTabs.filter(':visible')
        .find('.ideal-field:first')
        .find('input:first, select, textarea').focus()
    } else {
      $form.find('.ideal-field:first')
        .find('input:first, select, textarea').focus()
    }
    return $form
  }

  $form.focusFirstInvalid = function () {
    var $first = $form.getInvalid().first()
    var tabName = $first.parents('.ideal-tabs-content')
      .data('ideal-tabs-content-name')
    if ($idealTabs) {
      $idealTabs.switchTab(tabName)
    }
    $first.find('input:first, select, textarea').focus()
    return $form
  }

  $form.switchTab = function (nameOrIdx) {
    $idealTabs.switchTab(nameOrIdx)
    return $form
  }

  $form.nextTab = function () {
    $idealTabs.nextTab()
    return $form
  }

  $form.prevTab = function () {
    $idealTabs.prevTab()
    return $form
  }

  $form.firstTab = function () {
    $idealTabs.firstTab()
    return $form
  }

  $form.lastTab = function () {
    $idealTabs.lastTab()
    return $form
  }

  $form.fresh = function () {
    getUserInputs()
      .change()
      .parents('.ideal-field')
      .removeClass('valid invalid')
    return $form
  }

  $form.freshFields = function (fields) {
    fields = Utils.convertToArray(fields)
    for (var i = 0, l = fields.length; i < l; i++) {
      var $input = Utils.getByNameOrId(fields[i])
      $input.blur()
        .parents('.ideal-field')
        .removeClass('valid invalid')
    }
    return $form
  }

  $form.reload = function () {
    Actions.adjust()
    Actions.attachEvents()
    Actions.responsive()
    return $form
  }

  $form.reset = function () {
    var formInputs = getFormInputs()
    formInputs.text.val('') // text inputs
    formInputs.radiocheck.removeAttr('checked') // radio & check
    // Select and custom select
    formInputs.select.find('option').first().prop('selected', true)
    $form.find('.ideal-select').trigger('reset')
    // Reset all
    formInputs.inputs.change().blur()
    $form.focusFirst()
    if ($idealTabs) {
      $idealTabs.firstTab()
    }
    $form.fresh()
    return $form
  }

  $form.resetFields = function (fields) {
    fields = Utils.convertToArray(fields)
    var formInputs = getFormInputs(),
        $input, type,
        i, len = fields.length
    for (i = 0; i < len; i++) {
      $input = Utils.getByNameOrId(fields[i])
      type = Utils.getIdealType($input)
      if (type === 'text' || type === 'file') {
        $input.val('')
      }
      if (type === 'radiocheck') {
        $input.removeAttr('checked') // radio & check
      }
      if (type === 'select') {
        $input.find('option').first().prop('selected', true)
        $input.next('.ideal-select').trigger('reset')
      }
      $input.change().blur()
    }
    $form.freshFields(fields)
    return $form
  }

  $form.setOptions = function (options) {
    var curOps = formRef.options
    $.extend(true, curOps, options)
    $form.reload()
    $form.fresh()
    return $form
  }

  $form.setFieldOptions = function (name, options) {
    var curOps = formRef.options.inputs[name]
    $.extend(true, curOps, options)
    $form.reload()
    $form.freshFields([name])
    return $form
  }

  $form.toggleFields = function (fields) {
    fields = Utils.convertToArray(fields)
    var $fields = Utils.getFieldsFromArray(fields)
    $fields.each(function() {
      var $this = $(this)
      var name = $this.attr('name') || $this.attr('id')
      var inputRef = formRef.options.inputs[name]
      var filters = inputRef && inputRef.filters
      var dataFilters = $this.data('ideal-filters') || ''
      $this.data('ideal-filters', filters)
      $this.parents('.ideal-wrap').toggle(0, function(){
        $form.setFieldOptions(name, { filters: dataFilters })
      })
    })
    return $form
  }

/*--------------------------------------------------------------------------*/

  $form.on({
    keydown: function (e) {
      // Prevent submit when pressing enter
      // but exclude textareas
      if (e.which === 13 && e.target.nodeName !== 'TEXTAREA') {
        e.preventDefault()
      }
    },
    submit: function (e) {
      if (!$form.isValid()) {
        e.preventDefault()
        o.onFail()
        $form.focusFirstInvalid()
      } else {
        o.onSuccess(e)
      }
    }
  })

  // Start form
  if ($idealTabs) {
    $idealTabs.show() // Show all tabs to calculate widths and heights
  }
  Actions.init()
  Actions.attachEvents()
  $form.fresh()

  // Responsive
  if (o.responsiveAt) {
    $(window).resize(Actions.responsive)
    Actions.responsive()
  }

  if ($idealTabs) {
    $form.firstTab() // Done calculating hide tabs and start fresh
  }

  return this

}
