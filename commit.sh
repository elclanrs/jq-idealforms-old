#!/bin/sh
cd js && grunt && cd ..
lessc -x less/jquery.idealforms.less css/jquery.idealforms.css
echo 'Commit message: '
read commit
git commit -am "$commit"
git push origin master
