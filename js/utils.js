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
      if ($(this).outerWidth() > maxWidth) {
        maxWidth = $(this).outerWidth()
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
    return (/^\d+/).test(value) ? parseInt(value, 10) : value
  },
  /**
   * Like ES5 Object.keys
   */
  getKeys: function(obj){
    var keys = []
    for(var key in obj) keys.push(key)
    return keys
  }
}