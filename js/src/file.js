;(function( $ ) {

  // Browser supports HTML5 multiple file?
  var multipleSupport = typeof $('<input/>')[0].multiple !== 'undefined',
      isIE = /msie/i.test( navigator.userAgent )

  $.fn.idealFile = function() {

    return this.each(function() {

      var $file = $(this).addClass('ideal-file'), // the original file input
          // label that will be used for IE hack
          $wrap = $('<div class="ideal-file-wrap">'),
          $input = $('<input type="text" class="ideal-file-filename" />'),
          // Button that will be used in non-IE browsers
          $button = $('<button type="button" class="ideal-file-upload">Open</button>'),
          // Hack for IE
          $label = $('<label class="ideal-file-upload" for="'+ $file[0].id +'">Open</label>')

      // Hide by shifting to the left so we
      // can still trigger events
      $file.css({
        position: 'absolute',
        left: '-9999px'
      })

      $wrap.append( $input, ( isIE ? $label : $button ) ).insertAfter( $file )

      // Prevent focus
      $file.attr('tabIndex', -1)
      $button.attr('tabIndex', -1)

      $button.click(function () {
        $file.focus().click() // Open dialog
      })

      $file.change(function() {

        var files = [], fileArr, filename

        // If multiple is supported then extract
        // all filenames from the file array
        if ( multipleSupport ) {
          fileArr = $file[0].files
          for ( var i = 0, len = fileArr.length; i < len; i++ ) {
            files.push( fileArr[i].name )
          }
          filename = files.join(', ')

        // If not supported then just take the value
        // and remove the path to just show the filename
        } else {
          filename = $file.val().split('\\').pop()
        }

        $input.val( filename ) // Set the value
          .attr( 'title', filename ) // Show filename in title tootlip

      })

      $input.on({
        focus: function () { $file.trigger('change') },
        blur: function () { $file.trigger('blur') },
        keydown: function( e ) {
          if ( e.which === 13 ) { // Enter
            if ( !isIE ) { $file.trigger('click') }
          } else if ( e.which === 8 || e.which === 46 ) { // Backspace & Del
            // On some browsers the value is read-only
            // with this trick we remove the old input and add
            // a clean clone with all the original events attached
            $file.replaceWith( $file = $file.val('').clone( true ) )
            $file.trigger('change')
            $input.val('')
          } else if ( e.which === 9 ){ // TAB
            return
          } else { // All other keys
            return false
          }
        }
      })

    })

  }

}( jQuery ))

