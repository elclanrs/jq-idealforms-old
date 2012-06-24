/**
 * A custom <input type="file"> jQuery plugin
 * @example `$(':file').toCustomFile()`
 */
$.fn.toCustomFile = function () {
  return this.each(function () {

    var

    $file = $(this),
    $wrap = $('<div class="ideal-file-wrap">'),
    $input = $('<input type="text" class="ideal-file-filename" />'),
    $button = $('<button type="button" class="ideal-file-upload">Open</button>')

    $file.css({
      position: 'absolute',
      left: '-9999px'
    })

    // Events
    $button.click(function () {
      $file.trigger('click')
    })

    $file.on({
      change: function () {
        var filename = $file.val().split('\\').pop()
        $input.val(filename)
        $input.attr('title', filename)
      },
      focus: function () {
        $input.trigger('focus');
      }
    })

    $input.keydown(function (e) {
      if (e.which === 13) $file.trigger('click')
    })

    // Append to DOM
    $wrap.append($button, $input).insertAfter($file)

  })
}
