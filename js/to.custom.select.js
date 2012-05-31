/**
 * A custom <select> menu jQuery plugin
 * @example `$('select').toCustomSelect()`
 */
$.fn.toCustomSelect = function () {

  return this.each(function () {
    var $select = $(this)

    /**
     * Markup and elements of custom select
     * @memberOf $.fn.toCustomSelect
     * @returns {object} All elements of the new select replacement
     */
    var Select = (function () {
      var $options = $select.find('option'),
          $newSelect = $('<ul class="ideal-select '+ $select.attr('name') +'"/>'),
          $menu = $('<li><span class="title">' + $options.filter(':selected').text() + '</span></li>'),
          items = (function () {
            var items = []
            $options.each(function () {
              var $this = $(this)
              items.push('<li class="item" ideal-value="' + $this.val() + '">' + $this.text() + '</li>')
            })
            return items
          }())

      $menu.append('<ul class="sub">' + items.join('') + '</ul>')
      $newSelect.append($menu)

      return {
        options: $options,
        select: $newSelect,
        title: $menu.find('.title'),
        sub: $menu.find('.sub'),
        items: $menu.find('.sub li')
      }
    }())

    /**
     * @namespace Methods of custom select
     * @memberOf $.fn.toCustomSelect
     */
    var Actions = {
      /**
       * @private
       */
      init: (function () {
        $select.css({
          position: 'absolute',
          left: '-9999px'
        })
        Select.select.insertAfter($select)
        Select.sub.hide()
        Select.items.eq(Select.options.filter(':selected').index()).addClass('selected')
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
        Select.select.addClass('focus')
        $(document).on('keydown.noscroll', Actions.noWindowScroll)
      },
      blur: function () {
        Select.select.removeClass('open focus')
        $(document).off('.noscroll')
      },
      scrollIntoView: function (dir) {
        var $selected = Select.items.filter('.selected'),
            itemHeight = $selected.outerHeight(),
            menuHeight = Select.sub.outerHeight(),
            isInView = (function () {
              var elPos = $selected.position().top + itemHeight
              return dir === 'down'
                ? elPos <= menuHeight
                : elPos > 0
            }())

        if (!isInView) {
          itemHeight = (dir === 'down')
            ? itemHeight
            : -itemHeight
          Select.sub.scrollTop(Select.sub.scrollTop() + itemHeight)
        }
      },
      scrollToItem: function () {
        var idx = Select.items.filter('.selected').index(),
            height = Select.items.outerHeight(),
            items = Select.items.length,
            allHeight = height * items,
            curHeight = height * (items - idx)

        Select.sub.scrollTop(allHeight - curHeight)
      },
      showMenu: function () {
        Select.sub.fadeIn('fast')
        Select.select.addClass('open')
        Actions.select(Select.options.filter(':selected').index())
        Actions.scrollToItem()
      },
      hideMenu: function () {
        Select.sub.hide()
        Select.select.removeClass('open')
      },
      select: function (idx) {
        Select.items.removeClass('selected')
        Select.items.eq(idx).addClass('selected')
      },
      change: function (idx) {
        var text = Select.items.eq(idx).text()
        Actions.select(idx)
        Select.title.text(text)
        Select.options.eq(idx).prop('selected', true)
        $select.trigger('change')
      },
      keydown: function (key) {
        var idx = Select.items.filter('.selected').index()
        /**
         * @namespace Key pressed
         */
        var keys = {
          9: function () { // TAB
            if (Select.select.is('.menu')) {
              Actions.blur()
              Actions.hideMenu()
            }
          },
          13: function () { // ENTER
            if (Select.select.is('.menu')) {
              Select.select.is('.open')
                ? Actions.hideMenu()
                : Actions.showMenu()
            }
            Actions.change(idx)
          },
          27: function () { // ESC
            if (Select.select.is('.menu')) Actions.hideMenu()
          },
          40: function () { // DOWN
            if (idx < Select.options.length - 1) {
              Select.select.is('.open')
                ? Actions.select(idx + 1)
                : Actions.change(idx + 1)
            }
            Actions.scrollIntoView('down')
          },
          38: function () { // UP
            if (idx > 0) {
              Select.select.is('.open')
                ? Actions.select(idx - 1)
                : Actions.change(idx - 1)
            }
            Actions.scrollIntoView('up')
          },
          'default': function () { // Letter
            var letter = String.fromCharCode(key),
                selIdx = Select.items.filter('.selected').parent().index(),
                curIdx = Select.items.filter(function () {
                  var re = new RegExp('^' + letter, 'i')
                  return re.test($(this).text())
                }).first().index()

            Actions.change(!~curIdx ? selIdx : curIdx)
            Actions.scrollToItem()
            Actions.focusHack()
          }
        }
        keys[key] ? keys[key]() : keys['default']()
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
          if (!$(evt.target).closest(Select.select).length) {
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

    // Bind events
    var disableEvents = function () {
      Select.select.removeClass('menu list')
      $select.off('.menu .list')
      Select.items.off('.menu .list')
      Select.select.off('.menu .list')
      Select.title.off('.menu .list')
    }

    // Menu
    Select.select.on('menu', function () {
      disableEvents()
      Select.select.addClass('menu')
      Actions.hideMenu()
      $select.on({
        'blur.menu': events['blur.menu'],
        'focus.menu': events.focus,
        'keydown.menu': events.keydown
      })
      Select.select.on('mousedown.menu', events['hideOutside.menu'])
      Select.items.on('click.menu', events['clickItem.menu'])
      Select.title.on('click.menu', events['clickTitle.menu'])
    })

    // List
    Select.select.on('list', function () {
      disableEvents()
      Select.select.addClass('list')
      Actions.showMenu()
      $select.on({
        'blur.list': events['blur.list'],
        'focus.list': events.focus,
        'keydown.list': events.keydown
      })
      Select.select.on('mousedown.list', events['mousedown.list'])
      Select.items.on('mousedown.list', events['clickItem.list'])
    })

    Select.select.trigger('menu') // Default to "menu mode"
  })
}