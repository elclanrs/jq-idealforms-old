#!/bin/sh
grunt
echo 'Commit message: '
read commit
git commit -am "$commit" && git push origin master
git checkout gh-pages && git merge master && git push origin gh-pages && git checkout master
