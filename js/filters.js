/**
 * @namespace All default filters used for validation
 */
var Filters = {
  required: {
    error: 'This field is required'
  },
  number: {
    regex: /\d+/,
    error: 'Must be a number.'
  },
  digits: {
    regex: /^\d+$/,
    error: 'Must be only digits.'
  },
  name: {
    regex: /^[A-Za-z]{3,}$/,
    error: 'Must be at least 3 characters long, and must only contain letters.'
  },
  username: {
    regex: /^[a-z](?=[\w.]{3,31}$)\w*\.?\w*$/i,
    error: 'Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)'
  },
  pass: {
    regex: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
    error: 'Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter.'
  },
  strongpass: {
    regex: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    error: 'Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character.'
  },
  email: {
    regex: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/,
    error: 'Must be a valid e-mail address. <em>(e.g. user@gmail.com)</em>'
  },
  phone: {
    regex: /^[2-9]\d{2}-\d{3}-\d{4}$/,
    error: 'Must be a valid US phone number. <em>(e.g. 555-123-4567)</em>'
  },
  zip: {
    regex: /^\d{5}$|^\d{5}-\d{4}$/,
    error: 'Must be a valid US zip code. <em>(e.g. 33245 or 33245-0003)</em>'
  },
  url: {
    regex: /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{3,6}$/i,
    error: 'Must be a valid URL. <em>(e.g. www.google.com)</em>'
  },
  min: {
    regex: function (input, value) {
      var $input = input.input,
          min = input.userOptions.data.min
      if ($input.is(':checkbox, :radio')) {
        this.error = 'Check at least <strong>' + min + '</strong>'
        return $input.filter(':checked').length >= min
      }
      this.error = 'Must be at least <strong>' + min + '</strong> characters long.'
      return value.length >= min
    }
  },
  max: {
    regex: function (input, value) {
      var $input = input.input,
          max = input.userOptions.data.max
      if ($input.is(':checkbox, :radio')) {
        this.error = 'Check no more than <strong>' + max + '</strong>.'
        return $input.filter(':checked').length <= max
      }
      this.error = '<strong>' + max + '</strong> characters max.'
      return value.length <= max
    }
  },
  date: {
    regex: function (input, value) {
      var

      userFormat = input.userOptions.data
        ? input.userOptions.data.date
        : 'mm/dd/yyyy', // default format

      delimiter = /[^mdy]/.exec(userFormat)[0],
      theFormat = userFormat.split(delimiter),
      theDate = value.split(delimiter),

      isDate = function (date, format) {
        var m, d, y
        for (var i = 0, len = format.length; i < len; i++) {
          if (/m/.test(format[i])) m = date[i]
          if (/d/.test(format[i])) d = date[i]
          if (/y/.test(format[i])) y = date[i]
        }
        return (
          m > 0 && m < 13 &&
          y && y.length === 4 &&
          d > 0 && d <= (new Date(y, m, 0)).getDate()
        )
      }
      this.error = 'Must be a valid date. <em>(e.g. '+ userFormat +')</em>'
      return isDate(theDate, theFormat)
    }
  },
  exclude: {
    regex: function (input, value) {
      this.error = '"' + value + '" is not available.'
      return !~$.inArray(value, input.userOptions.data.exclude)
    }
  },
  equalto: {
    regex: function (input, value) {
      var $equals = $(input.userOptions.data.equalto),
          $input = input.input,
          name = $equals.attr('name') || $equals.attr('id')
      this.error = 'Must be the same value as <strong>"'+ name +'"</strong>'
      if (
        $equals
          .parents('.ideal-field')
          .filter(function(){ return $(this).data('isValid') === false })
          .length
      ) return false
      return $input.val() === $equals.val()
    }
  },
  extension: {
    regex: function (input, value) {
      var files = input.input[0].files || [{ name: value }],
          extensions = input.userOptions.data.extension,
          re = new RegExp('\\.'+ extensions.join('|') +'$', 'i'),
          valid = false
      for (var i = 0, len = files.length; i < len; i++) {
        if (re.test(files[i].name)) valid = true
        else valid = false
      }
      this.error =
        'File(s) must have a valid extension. ' +
        '<em>(e.g. "'+ extensions.join('", "') +'")</em>'
      return valid
    }
  }
}
