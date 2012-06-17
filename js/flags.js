var Flags = {
  noerror: function ($input) {
    $input.parent().siblings('.error').hide()
  },
  noicons: function ($input) {
    $input.siblings('.valid-icon, .invalid-icon').hide()
  },
  novalidicon: function ($input) {
    $input.siblings('.valid-icon').hide()
  },
  noinvalidicon: function ($input) {
    $input.siblings('.invalid-icon').hide()
  }
}
