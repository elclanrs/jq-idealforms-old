/**
 * @namespace All default filters used for validation
 */
var Filters = {
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
    regex: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
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
      var min = input.userOptions.data.min
      if (input.input.is(':checkbox, :radio')) {
        this.error = 'Check at least <strong>' + min + '</strong>'
        return input.input.filter(':checked').length >= min
      }
      this.error = 'Must be at least <strong>' + min + '</strong> characters long.'
      return value.length > min - 1
    }
  },
  max: {
    regex: function (input, value) {
      var max = input.userOptions.data.max
      this.error = '<strong>' + max + '</strong> characters max.'
      return value.length <= max
    }
  },
  date: {
    regex: function (input, value) {
      var match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value),
          isDate = function (m, d, y) {
            return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate()
          }
      return match && isDate(match[1], match[2], match[3])
    },
    error: 'Must be a valid date. <em>(e.g. mm/dd/yyyy)</em>'
  },
  exclude: {
    regex: function (input, value) {
      this.error = '"' + value + '" is not available.'
      return !~$.inArray(value, input.userOptions.data.exclude)
    }
  }
}