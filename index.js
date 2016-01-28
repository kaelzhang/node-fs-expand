'use strict'

module.exports = expand
expand.sync = expandSync

var glob = require('glob')
var _ = require('underscore')
var async = require('async')
var node_path = require('path')
var util = require('util')
var fs = require('fs')
var wrap = require('wrap-as-async')
var make_array = require('make-array')


function isGlob (pattern) {
  return ~ pattern.indexOf('*')
}


function parse_async_filter (filter) {
  if (util.isFunction(filter)) {
    return wrap(filter)
  }

  if (util.isString(filter)) {
    return function (src, done) {
      fs.stat(src, function (err, stat) {
        if (err) {
          return done(err)
        }

        if (check_stat_method(stat, filter)) {
          done(null, stat[filter]())
        }
      })
    }
  }
}


function parse_sync_filter (filter) {
  if (util.isFunction(filter)) {
    return filter
  }

  if (util.isString(filter)) {
    return function (src) {
      var stat = fs.statSync(src)
      if (check_stat_method(stat, filter)) {
        return stat[filter]()
      }

      invalid_stat_method(filter)
    }
  }
}


function check_stat_method (stat, filter) {
  if (!util.isFunction(stat[filter])) {
    throw new Error('"' + filter + '" is not a valid fs.Stats method name.')
  }

  return true
}


// @param {options}
// - globOnly: {Boolean} only deal with glob stars
function expand(patterns, options, callback) {
  patterns = make_array(patterns)

  if (util.isFunction(options)) {
    callback = options
    options = {}
  }

  options.filter = parse_async_filter(options.filter)

  async.parallel(
    patterns
    .filter(Boolean)
    .map(function(pattern) {
      return function(done) {
        if (options.globOnly && !isGlob(pattern)) {
          pattern = node_path.join('.', pattern)
          done(null, [pattern])
        } else {
          if (pattern.indexOf('!') === 0) {
            pattern = pattern.slice(1)
          }

          glob(pattern, options, done)
        }
      }
    }),

    function(err, results) {
      if (err) {
        return callback(err)
      }

      var result = []
      patterns.forEach(function(pattern, i) {
        var exclusion = pattern.indexOf('!') === 0

        if (exclusion) {
          result = _.difference(result, results[i])
        } else {
          result = _.union(result, results[i])
        }
      })

      if (!options.filter) {
        return callback(null, result)
      }

      async.map(result, function (src, done) {
        options.filter(absolutize_path(src, options), function (err, is) {
          if (err) {
            return done(err)
          }

          done(null, is && src)
        })

      }, function (err, result) {
        if (err) {
          return callback(err)
        }

        callback(null, result.filter(Boolean))
      })
    }
  )
}


function expandSync(patterns, options) {
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  patterns = Array.isArray(patterns) ? patterns : [patterns]

  if (!patterns.length) {
    return []
  }

  options.filter = parse_sync_filter(options.filter)

  var result = processPatterns(patterns, function(pattern) {
    if (options.globOnly && !isGlob(pattern)) {
      pattern = node_path.join('.', pattern)
      return [pattern]
    } else {
      // Find all matching files for this pattern.
      return glob.sync(pattern, options)
    }
  })

  if (!options.filter) {
    return result
  }

  return result.filter(function (src) {
    return options.filter(absolutize_path(src, options))
  })
}


function absolutize_path (src, options) {
  return options.cwd
    ? node_path.join(options.cwd, src)
    : src
}


// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
function processPatterns(patterns, fn) {

  // Filepaths to return.
  var result = []
  // Iterate over flattened patterns array.
  _.flatten(patterns).forEach(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf('!') === 0
    // If the pattern is an exclusion, remove the !
    if (exclusion) {
      pattern = pattern.slice(1)
    }
    // Find all matching files for this pattern.
    var matches = fn(pattern)

    if (exclusion) {
      // If an exclusion, remove matching files.
      result = _.difference(result, matches)
    } else {
      // Otherwise add matching files.
      result = _.union(result, matches)
    }
  })

  return result
}


//compatibility for node <= 0.10.x
if (!util.isFunction) {
  util.isFunction = function (subject) {
    return typeof subject === 'function'
  }
}