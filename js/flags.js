var Flags = {
  noerror: function (i) {
    i.parent().siblings('.error').hide()
  },
  noicons: function (i) {
    i.siblings('.valid-icon, .invalid-icon').hide()
  },
  novalidicon: function (i) {
    i.siblings('.valid-icon').hide()
  },
  noinvalidicon: function (i) {
    i.siblings('.invalid-icon').hide()
  }
}
