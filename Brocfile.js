var concat = require('broccoli-concat');
var uglifyJavaScript = require('broccoli-uglify-js');
var mergeTrees = require('broccoli-merge-trees')

var src = 'src';

var js = concat(src, {
    inputFiles: [
      '**/*.js'
    ],
    outputFile: '/photosphere.js'
});

var min = uglifyJavaScript(
  concat(src, {
    inputFiles: [
      '**/*.js'
    ],
    outputFile: '/photosphere.min.js'
  })
);

var tree = mergeTrees([js, min]);

module.exports = tree;
