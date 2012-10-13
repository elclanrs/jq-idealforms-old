/**
 * A custom <select> menu jQuery plugin
 * @example `$('select').idealSelect()`
 */
$.fn.idealSelect = function () {

  return this.each(function () {

    var

    $select = $(this),
    $options = $select.find('option')

    /**
     * Generate markup and return elements of custom select
     * @memberOf $.fn.toCustomSelect
     * @returns {object} All elements of the new select replacement
     */
    var idealSelect = (function () {
      var
      $wrap = $('<ul class="ideal-select '+ $select.attr('name') +'"/>'),
      $menu = $(
        '<li><span class="ideal-select-title">' +
          $options.filter(':selected').text() +
        '</span></li>'
      ),
      items = (function () {
        var items = []
        $options.each(function () {
          var $this = $(this)
          items.push('<li class="ideal-select-item">' + $this.text() + '</li>')
        })
        return items
      }())

      $menu.append('<ul class="ideal-select-sub">' + items.join('') + '</ul>')
      $wrap.append($menu)

      return {
        select: $wrap,
        title: $menu.find('.ideal-select-title'),
        sub: $menu.find('.ideal-select-sub'),
        items: $menu.find('.ideal-select-item')
      }
    }())

    /**
     * @namespace Methods of custom select
     * @memberOf $.fn.toCustomSelect
     */
    var Actions = {

      getSelectedIdx: function () {
        return idealSelect.items
          .filter('.ideal-select-item-selected').index()
      },

      /**
       * @private
       */
      init: (function () {
        $select.css({
          position: 'absolute',
          left: '-9999px'
        })
        idealSelect.sub.hide()
        idealSelect.select.insertAfter($select)
        idealSelect.select.css(
          'min-width',
          Utils.getMaxWidth(idealSelect.items)
        )
        idealSelect.items
          .eq($options.filter(':selected').index())
          .addClass('ideal-select-item-selected')
      }()),

      noWindowScroll: function (e) {
        if (e.which === 40 || e.which === 38 || e.which === 13) {
          e.preventDefault()
        }
      },

      // Fix loosing focus when scrolling
      // and selecting item with keyboard
      focusHack: function () {
        setTimeout(function () {
          $select.trigger('focus')
        }, 1)
      },

      focus: function () {
        idealSelect.select.addClass('ideal-select-focus')
        $(document).on('keydown.noscroll', Actions.noWindowScroll)
      },

      blur: function () {
        idealSelect.select
          .removeClass('ideal-select-open ideal-select-focus')
        $(document).off('.noscroll')
      },

      scrollIntoView: function (dir) {
        var
        $selected = idealSelect.items.filter('.ideal-select-item-selected'),
        itemHeight = idealSelect.items.outerHeight(),
        menuHeight = idealSelect.sub.outerHeight(),

        isInView = (function () {
          // relative position to the submenu
          var elPos = $selected.position().top + itemHeight
          return dir === 'down'
            ? elPos <= menuHeight
            : elPos > 0
        }())

        if (!isInView) {
          itemHeight = (dir === 'down')
            ? itemHeight // go down
            : -itemHeight // go up

          idealSelect.sub
            .scrollTop(idealSelect.sub.scrollTop() + itemHeight)
        }
      },

      scrollToItem: function () {
        var idx = Actions.getSelectedIdx(),
            height = idealSelect.items.outerHeight(),
            nItems = idealSelect.items.length,
            allHeight = height * nItems,
            curHeight = height * (nItems - idx)

        idealSelect.sub.scrollTop(allHeight - curHeight)
      },

      showMenu: function () {
        idealSelect.sub.fadeIn('fast')
        idealSelect.select.addClass('ideal-select-open')
        Actions.select(Actions.getSelectedIdx())
        Actions.scrollToItem()
      },

      hideMenu: function () {
        idealSelect.sub.hide()
        idealSelect.select.removeClass('ideal-select-open')
      },

      select: function (idx) {
        idealSelect.items
          .removeClass('ideal-select-item-selected')
        idealSelect.items
          .eq(idx).addClass('ideal-select-item-selected')
      },

      change: function (idx) {
        var text = idealSelect.items.eq(idx).text()
        Actions.select(idx)
        idealSelect.title.text(text)
        $options.eq(idx).prop('selected', true)
        $select.trigger('change')
      },

      keydown: function (key) {
        var

        idx = Actions.getSelectedIdx(),
        isMenu = idealSelect.select.is('.ideal-select-menu'),
        isOpen = idealSelect.select.is('.ideal-select-open')

        /**
         * @namespace Key pressed
         */
        var keys = {

          9: function () { // TAB
            if (isMenu) {
              Actions.blur()
              Actions.hideMenu()
            }
          },

          13: function () { // ENTER
            if (isMenu)
              isOpen
                ? Actions.hideMenu()
                : Actions.showMenu()
            Actions.change(idx)
          },

          27: function () { // ESC
            if (isMenu) Actions.hideMenu()
          },

          40: function () { // DOWN
            if (idx < $options.length - 1) {
              isOpen
                ? Actions.select(idx + 1)
                : Actions.change(idx + 1)
            }
            Actions.scrollIntoView('down')
          },

          38: function () { // UP
            if (idx > 0) {
              isOpen
                ? Actions.select(idx - 1)
                : Actions.change(idx - 1)
            }
            Actions.scrollIntoView('up')
          },

          'default': function () { // Letter
            var

            letter = String.fromCharCode(key),

            $matches = idealSelect.items
              .filter(function () {
                var re = new RegExp('^' + letter, 'i')
                return re.test($(this).text())
              }),
            nMatches = $matches.length,

            counter = idealSelect.select.data('counter') + 1 || 0,
            curKey = idealSelect.select.data('key') || key,

            newIdx = $matches.eq(counter).index()

            if (!nMatches) // No matches
              return false

            // If more matches with same letter
            if (curKey === key) {
              if (counter < nMatches) {
                idealSelect.select.data('counter', counter)
              }
              else {
                idealSelect.select.data('counter', 0)
                newIdx = $matches.eq(0).index()
              }
            }
            // If new letter
            else {
              idealSelect.select.data('counter', 0)
              newIdx = $matches.eq(0).index()
            }

            if (isOpen)
              Actions.select(newIdx)
            else
              Actions.change(newIdx)

            idealSelect.select.data('key', key)

            Actions.scrollToItem()
            Actions.focusHack()
          }
        }

        keys[key]
          ? keys[key]()
          : keys['default']()
      }
    }

    /**
     * @namespace Holds all events of custom select for "menu mode" and "list mode"
     * @memberOf $.fn.toCustomSelect
     */
    var events = {
      focus: Actions.focus,
      'blur.menu': function () {
        Actions.blur()
        Actions.hideMenu()
      },
      'blur.list': function () {
        Actions.blur()
      },
      keydown: function (e) {
        Actions.keydown(e.which)
      },
      'clickItem.menu': function () {
        Actions.change($(this).index())
        Actions.hideMenu()
      },
      'clickItem.list': function () {
        Actions.change($(this).index())
      },
      'clickTitle.menu': function () {
        Actions.focus()
        Actions.showMenu()
        $select.trigger('focus')
      },
      'hideOutside.menu': function () {
        $select.off('blur.menu')
        $(document).on('mousedown.ideal', function (evt) {
          if (!$(evt.target).closest(idealSelect.select).length) {
            $(document).off('mousedown.ideal')
            $select.on('blur.menu', events['blur.menu'])
          } else {
            Actions.focusHack()
          }
        })
      },
      'mousedown.list': function () {
        Actions.focusHack()
      }
    }

    // Reset events
    var disableEvents = function () {
      idealSelect.select.removeClass('ideal-select-menu ideal-select-list')
      $select.off('.menu .list')
      idealSelect.items.off('.menu .list')
      idealSelect.select.off('.menu .list')
      idealSelect.title.off('.menu .list')
    }

    // Menu mode
    idealSelect.select.on('menu', function () {
      disableEvents()
      idealSelect.select.addClass('ideal-select-menu')
      Actions.hideMenu()
      $select.on({
        'blur.menu': events['blur.menu'],
        'focus.menu': events.focus,
        'keydown.menu': events.keydown
      })
      idealSelect.select.on('mousedown.menu', events['hideOutside.menu'])
      idealSelect.items.on('click.menu', events['clickItem.menu'])
      idealSelect.title.on('click.menu', events['clickTitle.menu'])
    })

    // List mode
    idealSelect.select.on('list', function () {
      disableEvents()
      idealSelect.select.addClass('ideal-select-list')
      Actions.showMenu()
      $select.on({
        'blur.list': events['blur.list'],
        'focus.list': events.focus,
        'keydown.list': events.keydown
      })
      idealSelect.select.on('mousedown.list', events['mousedown.list'])
      idealSelect.items.on('mousedown.list', events['clickItem.list'])
    })

    $select.keydown(function (e) {
      // Prevent default keydown event
      // to avoid bugs with Ideal Select events
      if (e.which !== 9) e.preventDefault()
    })

    // Reset
    idealSelect.select.on('reset', function(){
      Actions.change(0)
    })

    idealSelect.select.trigger('menu') // Default to "menu mode"
  })
}
