#!/bin/sh
cat \
start.js \
utils.js \
to.custom.select.js \
to.custom.radiocheck.js \
to.custom.file.js \
filters.js \
flags.js \
idealforms.js \
end.js \
| uglifyjs -o min/jquery.idealforms.min.js
