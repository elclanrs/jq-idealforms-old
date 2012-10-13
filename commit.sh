#!/bin/sh
grunt
echo 'Commit message: '
read commit
git commit -am "$commit"
git push origin master
