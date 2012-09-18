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
    $elms.each(function() {
      var width = $(this).outerWidth()
      if (width > maxWidth) {
        maxWidth = width
      }
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
    for(var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key)
      }
    }
    return keys
  },
  // Get lenght of an object
  getObjSize: function(obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        size++;
      }
    }
    return size;
  },
  isFunction: function (obj) {
    return typeof obj === 'function'
  },
  isRegex: function (obj) {
    return obj instanceof RegExp
  },
  isString: function (obj) {
    return typeof obj === 'string'
  },
  getByNameOrId: function (str) {
    var $el = $('[name="'+ str +'"]').length
      ? $('[name="'+ str +'"]') // by name
      : $('#'+ str) // by id
    return $el.length
      ? $el
      : $.error('The field "'+ str + '" doesn\'t exist.')
  },
  getFieldsFromArray: function (fields) {
    var f = []
    for (var i = 0, l = fields.length; i < l; i++) {
      f.push( Utils.getByNameOrId(fields[i]).get(0) )
    }
    return $(f)
  },
  convertToArray: function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
      ? obj
      : [obj]
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

    var markup, items = [], item, value, i, len

    function splitValue(str) {
      var item, value, arr
      if (/:/.test(str)) {
        arr = str.split(':')
        item = arr[0]
        value = arr[1]
      } else {
        item = value = str
      }
      return { item: item, value: value }
    }

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
      for (i = 0, len = list.length; i < len; i++) {
        item = splitValue(list[i]).item
        value = splitValue(list[i]).value
        items.push('<option value="'+ value +'">'+ item +'</option>')
      }
      markup =
        '<select id="'+ name +'" name="'+ name +'">'+
          items.join('') +
        '</select>'
    }

    // Radiocheck
    if (/(radio|checkbox)/.test(type)) {
      items = []
      for (i = 0, len = list.length; i < len; i++) {
        item = splitValue(list[i]).item
        value = splitValue(list[i]).value
        items.push(
          '<label>'+
            '<input type="'+ type +'" name="'+ name +'" value="'+ value +'" />'+
            item +
          '</label>'
        )
      }
      markup = items.join('')
    }

    return markup
  }
}
