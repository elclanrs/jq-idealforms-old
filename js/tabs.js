/**
 * Custom tabs for Ideal Forms
 */
$.fn.idealTabs = function (container) {

  var

  // Elements
  $contents = this,
  $container = container,
  $wrapper = $('<ul class="ideal-tabs-wrap"/>'),
  $tabs = (function () {
    var tabs = []
    $contents.each(function () {
      var name = $(this).attr('name')
      var html =
        '<li class="ideal-tabs-tab">'+
          '<span>' + name + '</span>'+
          '<i class="ideal-tabs-tab-counter ideal-tabs-tab-counter-zero">0</i>'+
        '</li>'
      tabs.push(html)
    })
    return $(tabs.join(''))
  }()),

  Actions = {
    getCurIdx: function () {
      return $tabs
        .filter('.ideal-tabs-tab-active')
        .index()
    },
    getTabIdxByName: function (name) {
      var re = new RegExp(name, 'i')
      var $tab = $tabs.filter(function () {
        return re.test($(this).text())
      })
      return $tab.index()
    }
  },

  /**
   * Public methods
   */
  Methods = {
    /**
     * Switch tab
     */
    switchTab: function (nameOrIdx) {

      var idx = Utils.isString(nameOrIdx)
        ? Actions.getTabIdxByName(nameOrIdx)
        : nameOrIdx

      $tabs.removeClass('ideal-tabs-tab-active')
      $tabs.eq(idx).addClass('ideal-tabs-tab-active')
      $contents.hide().eq(idx).show()
    },

    nextTab: function () {
      var idx = Actions.getCurIdx() + 1
      idx > $tabs.length - 1
        ? Methods.firstTab()
        : Methods.switchTab(idx)
    },

    prevTab: function () {
      Methods.switchTab(Actions.getCurIdx() - 1)
    },

    firstTab: function () {
      Methods.switchTab(0)
    },

    lastTab: function () {
      Methods.switchTab($tabs.length - 1)
    },

    updateCounter: function (nameOrIdx, text) {
      var idx = !isNaN(nameOrIdx) ? nameOrIdx : Actions.getTabIdxByName(name),
          $counter = $tabs.eq(idx).find('.ideal-tabs-tab-counter')
      $counter.removeClass('ideal-tabs-tab-counter-zero')
      if (!text) {
        $counter.addClass('ideal-tabs-tab-counter-zero')
      }
      $counter.html(text)
    }
  }

  // Attach methods
  for (var m in Methods)
    $contents[m] = Methods[m]

  // Init
  $tabs.first()
    .addClass('ideal-tabs-tab-active')
    .end()
    .click(function () {
      var name = $(this).text()
      $contents.switchTab(name)
    })

  // Insert in DOM & Events
  $wrapper.append($tabs).appendTo($container)

  $contents.addClass('ideal-tabs-content')
  $contents.each(function () {
    var $this = $(this), name = $(this).attr('name')
    $this.data('ideal-tabs-content-name', name)
      .removeAttr('name')
  })
  $contents.hide().first().show() // Start fresh

  return $contents

}
