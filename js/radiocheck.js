/*
 * idealRadioCheck: jQuery plguin for checkbox and radio replacement
 * Usage: $('input[type=checkbox], input[type=radio]').idealRadioCheck()
 */
;(function(){
$.fn.idealRadioCheck = function() {

  return this.each(function() {

    var $this = $(this)
    var $span = $('<span/>')

    $span.addClass('ideal-'+ ($this.is(':checkbox') ? 'check' : 'radio'))
    $this.is(':checked') && $span.addClass('checked') // init
    $span.insertAfter($this)

    $this.parent('label').addClass('ideal-radiocheck-label')
      .attr('onclick', '') // Fix clicking label in iOS
    $this.css({ position: 'absolute', left: '-9999px' }) // hide by shifting left

    // Events
    $this.on({
      change: function() {
        var $this = $(this)
        if ($this.is(':radio')) {
          $this.parent().siblings('label').find('.ideal-radio').removeClass('checked')
        }
        $span.toggleClass('checked')
      },
      focus: function() { $span.addClass('focus') },
      blur: function() { $span.removeClass('focus') },
      click: function() { $(this).trigger('focus') }
    })
  })
}
}())

