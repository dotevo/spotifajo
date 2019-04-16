#!/bin/bash
cd `dirname "$0"`
npm start
cd data
ls top100_*.json > top100.txt
ls plena_*.json > plena.txt
git add *.json
git add *.txt
git commit -a -m "$(date +\%Y-\%m-\%d)"
#git push -u
