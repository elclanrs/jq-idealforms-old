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
        // Detect if browser supports HTML5 "file multiple"
        var multipleSupport = typeof $('input')[0].multiple !== 'undefined',
            files = [],
            fileArr,
            filename
        if (multipleSupport) {
          fileArr = $file[0].files
          for (var i = 0, len = fileArr.length; i < len; i++)
            files.push(fileArr[i].name)
          filename = files.join(', ')
        } else {
          filename = $file.val().split('\\').pop()
        }
        $input.val(filename)
        $input.attr('title', filename)
      },
      focus: function () {
        $input.trigger('focus')
      }
    })

    $input
      .on({
        keyup: function () { $file.trigger('change') },
        focus: function () { $file.trigger('change') },
        blur: function () { $file.trigger('blur') },
        keydown: function (e) { if (e.which === 13) $file.trigger('click') }
      })

    // Append to DOM
    $wrap.append($button, $input).insertAfter($file)

  })
}
