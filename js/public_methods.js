/*
 * Public Methods
 */
$.extend( IdealForms.prototype, {

  getInvalid: function() {
    return this.$form.find('.ideal-field').filter(function() {
      return $(this).data('ideal-isvalid') === false
    })
  },

  getInvalidInTab: function( nameOrIdx ) {
    return this._getTab( nameOrIdx ).find('.ideal-field').filter(function() {
      return $(this).data('ideal-isvalid') === false
    })
  },

  isValid: function() {
    return !this.getInvalid().length
  },

  isValidField: function( field ) {
    var $input = Utils.getByNameOrId( field )
    return $input.parents('.ideal-field').data('ideal-isvalid') === true
  },

  focusFirst: function() {
    if ( this.$tabs.length ) {
      this.$tabs.filter(':visible')
        .find('.ideal-field:first')
        .find('input:first, select, textarea').focus()
    } else {
      this.$form.find('.ideal-field:first')
        .find('input:first, select, textarea').focus()
    }
    return this
  },

  focusFirstInvalid: function() {
    var $first = this.getInvalid().first().find('input:first, select, textarea')
    var tabName = $first.parents('.ideal-tabs-content').data('ideal-tabs-content-name')
    if ( this.$tabs.length ) {
      this.switchTab( tabName )
    }
    $first.focus()
    return this
  },

  switchTab: function( nameOrIdx ) {
    this.$tabs.switchTab( nameOrIdx )
    return this
  },

  nextTab: function() {
    this.$tabs.nextTab()
    return this
  },

  prevTab: function() {
    this.$tabs.prevTab()
    return this
  },

  firstTab: function() {
    this.$tabs.firstTab()
    return this
  },

  lastTab: function() {
    this.$tabs.lastTab()
    return this
  },

  fresh: function() {
    this._getUserInputs().change().parents('.ideal-field')
      .removeClass('valid invalid')
    return this
  },

  freshFields: function( fields ) {
    fields = Utils.convertToArray( fields )
    $.each( fields, function( i ) {
      var $input = Utils.getByNameOrId( fields[ i ] )
      $input.change().parents('.ideal-field').removeClass('valid invalid')
    })
    return this
  },

  reload: function() {
    this._adjust()
    this._attachEvents()
    this._getUserInputs().change()
    return this
  },

  reset: function() {

    var formElements = this._getFormElements()

    formElements.text.val('') // text inputs
    formElements.radiocheck.removeAttr('checked') // radio & check
    // Select and custom select
    formElements.select.find('option').first().prop( 'selected', true )
    this.$form.find('.ideal-select').trigger('reset')

    if ( this.$tabs.length ) { this.firstTab() }

    this.focusFirst().fresh()

    return this

  },

  resetFields: function( fields ) {

    fields = Utils.convertToArray( fields )
    var formElements = this._getFormElements()

    $.each( fields, function( i, v ) {
      var $input = Utils.getByNameOrId( v )
      var type = Utils.getIdealType( $input )
      if ( type === 'text' || type === 'file' ) {
        $input.val('')
      }
      if ( type === 'radiocheck' ) {
        $input.removeAttr('checked') // radio & check
      }
      if ( type === 'select' ) {
        $input.find('option').first().prop( 'selected', true )
        $input.next('.ideal-select').trigger('reset')
      }
      $input.change()
    })

    this.freshFields( fields )

    return this

  },

  toggleFields: function( fields ) {

    fields = Utils.convertToArray( fields )
    var self = this
    var $fields = Utils.getFieldsFromArray( fields )

    $fields.each(function() {
      var $this = $(this)
      var name = $this.attr('name') || $this.attr('id')
      var input = self.opts.inputs[ name ]
      var filters = input && input.filters
      var dataFilters = $this.data('ideal-filters') || ''
      $this.data( 'ideal-filters', filters )
      $this.closest('.ideal-wrap').toggle()
      self.setFieldOptions( name, { filters: dataFilters } )
    })

    self._getUserInputs().change()

    return this
  },

  setOptions: function( options ) {
    $.extend( true, this.opts, options )
    this.reload().fresh()
    return this
  },

  setFieldOptions: function( name, options ) {
    $.extend( true, this.opts.inputs[ name ], options )
    this.reload().freshFields([ name ])
    return this
  },

  addFields: function( fields ) {

    fields = Utils.convertToArray( fields )

    var self = this

    // Save names of all inputs in Array
    // to use methods that take names ie. fresh()
    var allNames = []

    // Add an input to the DOM
    function add( ops ) {

      var name = ops.name

      var userOptions = {
        filters: ops.filters || '',
        data: ops.data || {},
        errors: ops.errors || {},
        flags: ops.flags || ''
      }

      var label = ops.label || ''
      var type = ops.type
      var list = ops.list || []
      var placeholder = ops.placeholder || ''

      var $field = $('<div>'+
          '<label>'+ label +':</label>'+ Utils.makeInput( name, type, list, placeholder ) +
        '</div>')
      var $input = $field.find('input, select, textarea, :button')

      // Add inputs with filters to the list
      // of user inputs to validate
      if ( userOptions.filters ) { self.opts.inputs[ name ] = userOptions }

      self._doMarkup( $input )

      // Insert in DOM
      if ( ops.addAfter ) {
        $field.insertAfter(
          $(Utils.getByNameOrId( ops.addAfter )).parents('.ideal-wrap')
        )
      } else if ( ops.addBefore ) {
        $field.insertBefore(
          $(Utils.getByNameOrId( ops.addBefore ))
          .parents('.ideal-wrap')
        )
      } else if ( ops.appendToTab ) {
        $field.insertAfter(
          self._getTab( ops.appendToTab ).find('.ideal-wrap:last-child')
        )
      } else {
        $field.insertAfter( $form.find('.ideal-wrap').last() )
      }

      // Add current field name to list of names
      allNames.push( name )
    }

    // Run through each input
    $.each( fields, function( i, ops ) { add( ops ) })

    self.reload()
    self.freshFields( allNames )
    self._responsive()

    return this

  },

  removeFields: function( fields ) {
    fields = Utils.convertToArray( fields )
    var $fields = Utils.getFieldsFromArray( fields )
    $fields.parents('.ideal-wrap').remove()
    this.reload()
    return this
  }

})

