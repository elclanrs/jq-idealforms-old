/**
 * A custom <input type="file"> jQuery plugin
 * @example `$(':file').idealFile()`
 */
$.fn.idealFile = function () {

  // Browser supports HTML5 multiple file?
  var multipleSupport = typeof $('input')[0].multiple !== 'undefined'

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
    $button
      .attr('tabIndex', -1)
      .click(function () {
        $file.trigger('click')
      })

    $file
      .attr('tabIndex', -1)
      .on({
        change: function () {
          var files = [],
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
        keydown: function (e) {
          // Enter
          if (e.which === 13) $file.trigger('click')
          // Backspace & Del
          if (e.which === 8 || e.which === 46)
            $file.val('')
        }
      })

    // Append to DOM
    $wrap.append($button, $input).insertAfter($file)

  })
}
