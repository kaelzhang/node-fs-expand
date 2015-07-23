'use strict';

module.exports = expand;
expand.sync = expandSync;

var glob = require('glob');
var _ = require('underscore');
var async = require('async');
var node_path = require('path');

// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
function processPatterns(patterns, fn) {

  // Filepaths to return.
  var result = [];
  // Iterate over flattened patterns array.
  _.flatten(patterns).forEach(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf('!') === 0;
    // If the pattern is an exclusion, remove the !
    if (exclusion) {
      pattern = pattern.slice(1);
    }
    // Find all matching files for this pattern.
    var matches = fn(pattern);

    if (exclusion) {
      // If an exclusion, remove matching files.
      result = _.difference(result, matches);
    } else {
      // Otherwise add matching files.
      result = _.union(result, matches);
    }
  });

  return result;
}

function isGlob (pattern) {
  return ~ pattern.indexOf('*');
}


// @param {options}
// - globOnly: {Boolean} only deal with glob stars
function expand(patterns, options, callback) {
  patterns = Array.isArray(patterns) ? patterns : [patterns];

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  

  async.parallel(
    patterns
    .filter(Boolean)
    .map(function(pattern) {
      return function(done) {
        if (options.globOnly && !isGlob(pattern)) {
          pattern = node_path.join('.', pattern);
          done(null, [pattern]);
        } else {
          if (pattern.indexOf('!') === 0) {
            pattern = pattern.slice(1);
          }

          glob(pattern, options, done);
        }
      };
    }),

    function(err, results) {
      if (err) {
        return callback(err);
      }

      var result = [];
      patterns.forEach(function(pattern, i) {
        var exclusion = pattern.indexOf('!') === 0;

        if (exclusion) {
          result = _.difference(result, results[i]);
        } else {
          result = _.union(result, results[i]);
        }
      });

      callback(null, result);
    }
  );
}


function expandSync(patterns, options) {
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  patterns = Array.isArray(patterns) ? patterns : [patterns];

  return patterns.length === 0 ? [] :

    processPatterns(patterns, function(pattern) {
      if (options.globOnly && !isGlob(pattern)) {
        pattern = node_path.join('.', pattern);
        return [pattern];
      } else {
        // Find all matching files for this pattern.
        return glob.sync(pattern, options);
      }
    });
}
