/*
 * Ideal Forms plugin
 */
var _defaults = {
  inputs: {},
  customFilters: {},
  customFlags: {},
  globalFlags: '',
  onSuccess: function(e) { alert('Thank you...') },
  onFail: function() { alert('Invalid!') },
  responsiveAt: 'auto',
  disableCustom: ''
}

// Constructor
var IdealForms = function( element, options ) {

  var self = this

  self.$form = $( element )
  self.opts = $.extend( {}, _defaults, options )

  self.$tabs = self.$form.find('section')

  // Set localized filters
  $.extend( $.idealforms.filters, getFilters() )

  self._init()

}

// Plugin
$.fn.idealforms = function( options ) {
  return this.each(function () {
    if ( !$.data( this, 'idealforms' ) ) {
      $.data( this, 'idealforms', new IdealForms( this, options ) )
    }
  })
}

// Get LESS variables
var LessVars = {
  fieldWidth: Utils.getLessVar( 'ideal-field-width', 'width' )
}
