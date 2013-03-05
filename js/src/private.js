/*
 * Private Methods
 */
$.extend( IdealForms.prototype, {

  _init: function() {

    var self = this
    var o = self.opts
    var formElements = self._getFormElements()

    self.$form.css( 'visibility', 'visible' )
      .addClass('ideal-form')
      .attr( 'novalidate', 'novalidate' ) // disable HTML5 validation

    // Do markup
    formElements.inputs
      .add( formElements.headings )
      .add( formElements.separators )
      .each(function(){ self._doMarkup( $(this) ) })

    // Generate tabs
    if ( self.$tabs.length ) {
      var $tabContainer = $('<div class="ideal-wrap ideal-tabs ideal-full-width"/>')
      self.$form.prepend( $tabContainer )
      self.$tabs.idealTabs( $tabContainer )
    }

    // Always show datepicker below the input
    if ( jQuery.ui ) {
      $.datepicker._checkOffset = function( a,b,c ) { return b }
    }

    // Add inputs specified by data-ideal
    // to the list of user inputs
    self.$form.find('[data-ideal]').each(function() {
      var userInput = o.inputs[ this.name ]
      o.inputs[ this.name ] = userInput || { filters: $(this).data('ideal') }
    })

   // Responsive
    if ( o.responsiveAt ) {
      $(window).resize(function(){ self._responsive() })
      self._responsive()
    }

    // Form events
    self.$form.on({
      keydown: function( e ) {
        // Prevent submit when pressing enter
        // but exclude textareas
        if ( e.which === 13 && e.target.nodeName !== 'TEXTAREA' ) {
          e.preventDefault()
        }
      },
      submit: function( e ) {
        if ( !self.isValid() ) {
          e.preventDefault()
          o.onFail()
          self.focusFirstInvalid()
        } else {
          o.onSuccess( e )
        }
      }
    })

    self._adjust()
    self._attachEvents()
    self.fresh() // Start fresh

  },

  _getFormElements: function() {
    return {
      inputs: this.$form.find('input, select, textarea, :button'),
      labels: this.$form.find('div > label:first-child'),
      text: this.$form.find('input:not([type="checkbox"], [type="radio"], [type="submit"]), textarea'),
      select: this.$form.find('select'),
      radiocheck: this.$form.find('input[type="radio"], input[type="checkbox"]'),
      buttons: this.$form.find(':button'),
      file: this.$form.find('input[type="file"]'),
      headings: this.$form.find('h1, h2, h3, h4, h5, h6'),
      separators: this.$form.find('hr'),
      hidden: this.$form.find('input:hidden')
    }
  },

  _getUserInputs: function() {
    return this.$form.find('[name="'+ Utils.getKeys( this.opts.inputs ).join('"], [name="') +'"]')
  },

  _getTab: function( nameOrIdx ) {
    var self = this
    var isNumber = !isNaN( nameOrIdx )
    if ( isNumber ) {
      return self.$tabs.eq( nameOrIdx )
    }
    return self.$tabs.filter(function() {
      var re = new RegExp( nameOrIdx, 'i' )
      return re.test( $(this).data('ideal-tabs-content-name') )
    })
  },

  _getCurrentTabIdx: function() {
    return this.$tabs.index( this.$form.find('.ideal-tabs-content:visible') )
  },

  _updateTabsCounter: function() {
    var self = this
    self.$tabs.each(function( i ) {
      var invalid = self.getInvalidInTab( i ).length
      self.$tabs.updateCounter( i, invalid )
    })
  },

  _adjust: function() {

    var self = this
    var o = self.opts
    var formElements = self._getFormElements()
    var curTab = self._getCurrentTabIdx()

    // Autocomplete causes some problems...
    formElements.inputs.attr('autocomplete', 'off')

    // Show tabs to calculate dimensions
    if ( self.$tabs.length ) { self.$tabs.show() }

    // Adjust labels
    var labels = formElements.labels
    labels.removeAttr('style').width( Utils.getMaxWidth( labels ) )

    // Adjust headings and separators
    if ( self.$tabs.length ) {
      this.$tabs.each(function(){
        $( this ).find('.ideal-heading:first').addClass('first-child')
      })
    } else {
      self.$form.find('.ideal-heading:first').addClass('first-child')
    }

    self._setDatepicker()

    // Done calculating hide tabs
    if ( self.$tabs.length ) {
      self.$tabs.hide()
      self.switchTab( curTab )
    }

  },

  _setDatepicker: function() {

    var o = this.opts
    var $datepicker = this.$form.find('input.datepicker')

    if ( jQuery.ui && $datepicker.length ) {

      $datepicker.each(function() {
        var userInput = o.inputs[ this.name ]
        var data = userInput && userInput.data && userInput.data.date
        var format = data ? data.replace( 'yyyy', 'yy' ) : 'mm/dd/yy'

        $(this).datepicker({
          dateFormat: format,
          beforeShow: function( input ) {
            $( input ).addClass('open')
          },
          onChangeMonthYear: function() {
            // Hack to fix IE9 not resizing
            var $this = $(this)
            var w = $this.outerWidth() // cache first!
            setTimeout(function() {
              $this.datepicker('widget').css( 'width', w )
            }, 1)
          },
          onClose: function() { $(this).removeClass('open') }
        })
      })

      // Adjust width
      $datepicker.on('focus keyup', function() {
        var t = $(this), w = t.outerWidth()
        t.datepicker('widget').css( 'width', w )
      })

      $datepicker.parent().siblings('.ideal-error').addClass('hidden')
    }
  },

  _doMarkup: function( $element ) {

    var o = this.opts
    var elementType = Utils.getIdealType( $element )

    // Validation elements
    var $field = $('<span class="ideal-field"/>')
    var $error = $('<span class="ideal-error" />')
    var $valid = $('<i class="ideal-icon ideal-icon-valid" />')
    var $invalid = $('<i class="ideal-icon ideal-icon-invalid"/>')
      .click(function(){
        $(this).parent().find('input:first, textarea, select').focus()
      })

    // Basic markup
    $element.closest('div').addClass('ideal-wrap')
      .children('label:first-child').addClass('ideal-label')

    var idealElements = {

      _defaultInput: function() {
        $element.wrapAll( $field ).after( $valid, $invalid )
          .parent().after( $error )
      },

      text: function() { idealElements._defaultInput() },

      radiocheck: function() {
        // Check if input is already wrapped so we don't
        // wrap radios and checks more than once
        var isWrapped = $element.parents('.ideal-field').length
        if ( !isWrapped ) {
          $element.parent().nextAll().andSelf().wrapAll( $field.addClass('ideal-radiocheck') )
          $element.parents('.ideal-field').append( $valid, $invalid ).after( $error )
        }
        if ( !/radiocheck/.test( o.disableCustom ) ) {
          $element.idealRadioCheck()
        }
      },

      select: function() {
        idealElements._defaultInput()
        if ( !/select/.test( o.disableCustom ) ) {
          $element.idealSelect()
        }
      },

      file: function() {
        idealElements._defaultInput()
        if ( !/file/.test( o.disableCustom ) ) {
          $element.idealFile()
        }
      },

      button: function() {
        if ( !/button/.test( o.disableCustom ) ) {
          $element.addClass('ideal-button')
        }
      },

      hidden: function() {
        $element.closest('div').addClass('ideal-hidden')
      },

      heading: function() {
        $element.closest('div').addClass('ideal-full-width')
        $element.parent().children().wrapAll('<span class="ideal-heading"/>')
      },

      separator: function() {
        $element.closest('div').addClass('ideal-full-width')
        $element.wrapAll('<div class="ideal-separator"/>')
      }

    }

    // Generate markup for current element type
    if ( idealElements[ elementType ] ) idealElements[ elementType ]()

    $error.add( $valid ).add( $invalid ).hide() // Start fresh

  },


  /** Validates an input and shows or hides error and icon
   * @memberOf Actions
   * @param {object} $input jQuery object
   * @param {string} e The JavaScript event
   */
  _validate: function( $input, e ) {

    var self = this
    var o = this.opts

    var userOptions = o.inputs[ $input.attr('name') ]
    var userFilters = userOptions.filters && userOptions.filters.split(/\s/)
    var name = $input.attr('name')
    var value = $input.val()

    var ajaxRequest = $.idealforms.ajaxRequests[ name ]

    var isRadioCheck = $input.is('[type="checkbox"], [type="radio"]')

    var inputData = {
      // If is radio or check validate all inputs related by name
      input: isRadioCheck ? self.$form.find('[name="' + name + '"]') : $input,
      userOptions: userOptions
    }

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
      $error.add( $invalid ).add( $valid ).hide()
    }

    function showOrHideError( error, valid ) {
      resetError()
      valid ? $valid.show() : $invalid.show()
      $field.addClass( valid ? 'valid' : 'invalid' )
      $field.data( 'ideal-isvalid', valid )
      if ( !valid ) {
        $error.html( error ).toggle( $field.is('.ideal-field-focus') )
      }
    }

    // Prevent validation when typing but not introducing any new characters
    // This is mainly to prevent multiple AJAX requests
    var oldValue = $input.data('ideal-value') || 0
    $input.data( 'ideal-value', value )
    if ( e.type === 'keyup' && value === oldValue ) { return false }

    // Validate
    if ( userFilters ) {

      $.each( userFilters, function( i, filter ) {

        var theFilter = $.idealforms.filters[ filter ]
        var customError = userOptions.errors && userOptions.errors[ filter ]
        var error = ''

        // If field is empty and not required
        if ( !value && filter !== 'required' ) {
          resetError()
          return false
        }

        if ( theFilter ) {

          // Abort and reset ajax if there's a request pending
          if ( e.type === 'keyup' && ajaxRequest ) {
            ajaxRequest.abort()
            $field.removeClass('ajax')
          }

          // AJAX
          if ( filter === 'ajax' ) {
            showOrHideError( error, false ) // set invalid till response comes back
            $error.hide()
            if ( e.type === 'keyup' ) {
              theFilter.regex( inputData, value, showOrHideError ) // runs the ajax callback
            } else {
              var ajaxError = $input.data('ideal-ajax-error')
              if ( ajaxError ) {
                showOrHideError( ajaxError, $input.data('ideal-ajax-resp') || false )
              }
            }
          }
          // All other filters
          else {
            var valid = Utils.isRegex( theFilter.regex ) && theFilter.regex.test( value ) ||
                        Utils.isFunction( theFilter.regex ) && theFilter.regex( inputData, value )
            error = customError || theFilter.error // assign error after calling regex()
            showOrHideError( error, valid )
            if ( !valid ) { return false }
          }
        }
      })
    }
    // Reset if there are no filters
    else {
      resetError()
    }

    // Flags
    var flags = (function(){
      var f = userOptions.flags && userOptions.flags.split(' ') || []
      if ( o.globalFlags ) {
        $.each( o.globalFlags.split(' '), function( i,v ) { f.push(v) })
      }
      return f
    }())
    if ( flags.length ) {
      $.each(flags, function( i,f ) {
        var theFlag = $.idealforms.flags[f]
        if ( theFlag ) { theFlag( $input, e.type ) }
      })
    }

    // Update counter
    if ( self.$tabs.length ) {
      self._updateTabsCounter( self._getCurrentTabIdx() )
    }
  },

  _attachEvents: function() {

    var self = this

    self._getUserInputs().on('keyup change focus blur', function(e) {

      var $this = $(this)
      var $field = $this.parents('.ideal-field')
      var isFile = $this.is('input[type=file]')

      // Trigger on change if type=file cuz custom file
      // disables focus on original file input (tabIndex = -1)
      if ( e.type === 'focus' || isFile && e.type === 'change' ) {
        $field.addClass('ideal-field-focus')
      }
      if ( e.type === 'blur' ) {
        $field.removeClass('ideal-field-focus')
      }

      self._validate( $this, e )
    })

  },

  _responsive: function() {

    var formElements = this._getFormElements()
    var maxWidth = LessVars.fieldWidth + formElements.labels.outerWidth()
    var $emptyLabel = formElements.labels.filter(function() {
      return $(this).html() === '&nbsp;'
    })
    var $customSelect = this.$form.find('.ideal-select')

    this.opts.responsiveAt === 'auto'
      ? this.$form.toggleClass( 'stack', this.$form.width() < maxWidth )
      : this.$form.toggleClass( 'stack', $(window).width() < this.opts.responsiveAt )

    var isStack = this.$form.is('.stack')
    $emptyLabel.toggle( !isStack )
    $customSelect.trigger( isStack ? 'list' : 'menu' )

    // Hide datePicker
    var $datePicker = this.$form.find('input.hasDatepicker')
    if ( $datePicker.length ) { $datePicker.datepicker('hide') }

  }

})
