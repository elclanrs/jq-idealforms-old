var Flags = {
  noerror: function (i) {
    i.parent().siblings('.ideal-error').hide()
  },
  noicons: function (i) {
    i.siblings('.ideal-icon-valid, .ideal-icon-invalid').hide()
  },
  novalidicon: function (i) {
    i.siblings('.ideal-icon-valid').hide()
  },
  noinvalidicon: function (i) {
    i.siblings('.ideal-icon-invalid').hide()
  },
  noclass: function (i) {
    i.parents('.ideal-field').removeClass('valid invalid')
  },
  novalidclass: function (i) {
    i.parents('.ideal-field').removeClass('valid')
  },
  noinvalidclass: function (i) {
    i.parents('.ideal-field').removeClass('invalid')
  }
}
