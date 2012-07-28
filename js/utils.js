/**
 * @namespace A chest for various Utils
 */
var Utils = {
  /**
   * Get width of widest element in the collection.
   * @memberOf Utils
   * @param {jQuery object} $elms
   * @returns {number}
   */
  getMaxWidth: function ($elms) {
    var maxWidth = 0
    $elms.each(function () {
      if ($(this).outerWidth() > maxWidth)
        maxWidth = $(this).outerWidth()
    })
    return maxWidth
  },
  /**
   * Hacky way of getting LESS variables
   * @memberOf Utils
   * @param {string} name The name of the LESS class.
   * @param {string} prop The css property where the data is stored.
   * @returns {number, string}
   */
  getLessVar: function (name, prop) {
    var value = $('<p class="' + name + '"></p>').hide().appendTo('body').css(prop)
    $('.' + name).remove()
    return (/^\d+/.test(value) ? parseInt(value, 10) : value)
  },
  /**
   * Like ES5 Object.keys
   */
  getKeys: function (obj) {
    var keys = []
    for(var key in obj) keys.push(key)
    return keys
  },
  isFunction: function (obj) {
    return typeof obj === 'function'
  },
  isRegex: function (obj) {
    return obj instanceof RegExp
  },
  getByNameOrId: function (str) {
    if ($('[name="'+ str +'"]').length)
      return $('[name="'+ str +'"]')
    else if ($('[name="'+ str +'"]').length)
      return $('#' + str)
    else
      $.error('The field "'+ str + '" doesn\'t exist.')
  },
  /**
   * Determine type of any Ideal Forms element
   * @param $input jQuery $input object
   */
  getIdealType: function ($el) {
    var type = $el.attr('type') || $el[0].tagName.toLowerCase()
    return (
      /(text|password|email|number|search|url|tel)/.test(type) && 'text' ||
      /file/.test(type) && 'file' ||
      /select/.test(type) && 'select' ||
      /(radio|checkbox)/.test(type) && 'radiocheck' ||
      /(button|submit|reset)/.test(type) && 'button' ||
      /h\d/.test(type) && 'description' ||
      /hr/.test(type) && 'separator' ||
      /hidden/.test(type) && 'hidden'
    )
  },
  /**
   * Generates an input
   * @param name `name` attribute of the input
   * @param type `type` or `tagName` of the input
   */
  makeInput: function (name, type, list, placeholder) {

    var markup, items = [], i, len

    // Text & file
    if (/(text|password|email|number|search|url|tel|file|hidden)/.test(type))
      markup = '<input '+
        'type="'+ type +'" '+
        'id="'+ name +'" '+
        'name="'+ name +'" ' +
        (placeholder && 'placeholder="'+ placeholder +'"') +
        '/>'

    // Select
    if (/select/.test(type)) {
      items = []
      for (i = 0, len = list.length; i < len; i++)
        items.push('<option value="'+ list[i] +'">'+ list[i] +'</option>')
      markup =
        '<select id="'+ name +'" name="'+ name +'">'+
          items.join('') +
        '</select>'
    }

    // Radiocheck
    if (/(radio|checkbox)/.test(type)) {
      items = []
      for (i = 0, len = list.length; i < len; i++)
        items.push(
          '<label>'+
            '<input type="'+ type +'" name="'+ name +'" value="'+ list[i] +'" />'+
            list[i] +
          '</label>'
        )
      markup = items.join('')
    }

    return markup
  }
}
