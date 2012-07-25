/**
 * A custom <input type="radio|checkbox"> jQuery plugin
 * @example `$(':radio, :checkbox').idealRadioCheck()`
 */
$.fn.idealRadioCheck = function () {
  return this.each(function () {
    var $this = $(this),
        $span = $('<span/>')

    $this.is(':checkbox')
      ? $span.addClass('ideal-check')
      : $span.addClass('ideal-radio')

    if ($this.is(':checked')) $span.addClass('checked')
    $span.insertAfter($this)

    $(this)
      .parent('label')
      .addClass('ideal-radiocheck-label')
      // Fix clicking label in iOS (iPhone, iPad)
      .attr('onclick','');

    $this
      .css({
        position: 'absolute',
        left: '-9999px'
      })
      .on({
        change: function () {
          var $this = $(this)
          $this.trigger('focus')
          if ($this.is(':radio')) {
            $this.parent().siblings('label').children('.ideal-radio').removeClass('checked')
            if ($this.is(':checked'))
              $this.next('.ideal-radio').addClass('checked')
          } else {
            $this.is(':checked')
              ? $span.addClass('checked')
              : $span.removeClass('checked')
          }
        },
        focus: function () {
          $span.parent().addClass('focus')
        },
        blur: function () {
          $span.parent().removeClass('focus')
        },
        click: function () {
          $(this).trigger('focus')
        }
      })
  })
}
