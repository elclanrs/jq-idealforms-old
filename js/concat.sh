#!/bin/sh
cat \
start.js \
utils.js \
tabs.js \
select.js \
radiocheck.js \
file.js \
filters.js \
jquery.idealforms.js \
private_methods.js \
public_methods.js \
end.js \
| uglifyjs -o min/jquery.idealforms.min.js
# -b -i 2 -nm -nmf 
