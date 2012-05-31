#!/bin/sh
cat \
start.js \
utils.js \
to.custom.select.js \
to.custom.radiocheck.js \
filters.js \
idealforms.js \
end.js \
| uglifyjs -o min/jquery.idealforms.min.js
