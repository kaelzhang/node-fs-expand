[![Build Status](https://travis-ci.org/kaelzhang/node-fs-expand.png?branch=master)](https://travis-ci.org/kaelzhang/node-fs-expand)
<!-- [![NPM version](https://badge.fury.io/js/fs-expand.png)](http://badge.fury.io/js/fs-expand)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-fs-expand.png)](https://gemnasium.com/kaelzhang/node-fs-expand) -->

# fs-expand

fs-expand is a standalone module to fetch all file or directory paths that match the given globbing pattern(s), which is much like [`grunt.file.expand`](http://gruntjs.com/api/grunt.file#grunt.file.expand)

The difference from [`glob`](http://www.npmjs.org/package/glob) is that `fs-expand`

- could combine the results of several glob patterns.
- supports negative matching patterns, such as '!*.js'

## expand(pattern, [options], callback);

- pattern `String|Array.<String>` accepts either a single glob pattern or an array of globbing patterns. Paths matching patterns that begin with ! will be excluded from the returned array. Patterns are processed in order, so inclusion and exclusion order is significant.
- options `Object` supports all [glob](https://www.npmjs.org/package/glob) library options
- callback `function(err, files)` the callback function.
- err `Error`
- files `Array.<String>` filenames found matching the pattern(s)

### `options.globOnly`

Type `Boolean=false`

Only process glob patterns, if a file does not contain globstars, `fs-expand` will not check the existence of the file.

```
<cwd>/
     |-- a.js
     |-- b.js
```

```js
expand([
  '*.js',
  'abc.md'
], {
  cwd: cwd,
  globOnly: true

}, function(err, files){
  files;
  // ->
  // [
  //   'a.js',
  //   'b.js',
  //   'abc.md' // actually, abc.md doesn't exist.
  // ]
});
```

### `options.filter`

Type `String|Function`

Either a valid [`fs.Stats`](https://nodejs.org/api/fs.html#fs_class_fs_stats) method name or a function that is passed the matched `src` filepath and returns `true` or `false`.

##### `fs.Stats` method name

```js
{
  filter: 'isDirectory'
}
```

##### Filter function

```js
{
  filter: function (src) {
    return fs.statSync(src).isFile()
  }
}
```

It can also be asynchoronous function by using the common [`this.async()`](https://www.npmjs.com/package/wrap-as-async) style, see [wrap-as-async](https://www.npmjs.com/package/wrap-as-async) for details

```js
{
  filter: function (src) {
    // Turns the filter function into an async one by calling `this.async()`
    var done = this.async()
    fs.stat(src, function (err, stat) {
      if (err) {
        return done(err)
      }

      done(null, stat.isFile())
    })
  }
}
```

#####



### Example

```
dir/
   |-- a.js
   |-- b.js
   |-- README.md
```

```js
var expand = require('fs-expand');

expand(['*.js', '*.md'], {
  cwd: dir
}, function(err, files){
	console.log(files); // ['a.js', 'b.js', README.md]
});
```

## expand.sync(pattern, [options]);

The synchronous version of `expand`.

Returns the filenames found.

```js
var files = expand.sync(['*.js', '!a.js']);

console.log(files); // ['b.js']
```
