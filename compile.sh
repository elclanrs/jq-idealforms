#!/bin/sh
stylus -c styl/jquery.idealforms.styl -o css/
browserify -d js/main.js > js/out/jquery.idealforms.js
cat js/out/jquery.idealforms.js | uglifyjs --comments -m -c warnings=false -o js/out/jquery.idealforms.min.js
