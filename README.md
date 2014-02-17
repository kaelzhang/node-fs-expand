# fs-expand [![NPM version](https://badge.fury.io/js/fs-expand.png)](http://badge.fury.io/js/fs-expand) [![Build Status](https://travis-ci.org/kaelzhang/node-fs-expand.png?branch=master)](https://travis-ci.org/kaelzhang/node-fs-expand) [![Dependency Status](https://gemnasium.com/kaelzhang/node-fs-expand.png)](https://gemnasium.com/kaelzhang/node-fs-expand)

fs-expand is a standalone module to fetch all file or directory paths that match the given globbing pattern(s), which is much like [`grunt.file.expand`](http://gruntjs.com/api/grunt.file#grunt.file.expand)

## expand(pattern, [options], callback);

- pattern `String|Array.<String>` accepts either a single glob pattern or an array of globbing patterns. Paths matching patterns that begin with ! will be excluded from the returned array. Patterns are processed in order, so inclusion and exclusion order is significant.
- options `Object` supports all [glob](https://www.npmjs.org/package/glob) library options
- callback `function(err, files)` the callback function.
- err `Error`
- files `Array.<String>` filenames found matching the pattern(s)


### Example

```js
var expand = require('fs-expand');

expand('*.js', function(err, files){
	console.log(files); // ['a.js', 'b.js']
});
```
