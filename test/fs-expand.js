'use strict'

var expect = require('chai').expect
var expand = require('../')

var node_path = require('path')
var fs = require('fs')

var fixtures = node_path.join(__dirname, 'fixtures')

describe("expand", function() {
  it("async", function(done) {
    expand([
      '*.js',
      '!c.js'
    ], {
      cwd: fixtures
    }, function(err, files) {
      expect(err).to.equal(null)
      expect(files.sort()).to.deep.equal([
        'a.js',
        'b.js'
      ])
      done()
    })
  })

  it("sync", function() {
    var files = expand.sync([
      '*.js',
      '!c.js'
    ], {
      cwd: fixtures
    })

    expect(files.sort()).to.deep.equal([
      'a.js',
      'b.js'
    ])
  })

  it("should maintain order", function(done){
    expand([
      '*.js',
      '*.md'
    ], {
      cwd: fixtures
    }, function (err, files) {
      expect(err).to.equal(null)
      expect(files.pop()).to.equal('README.md')
      done()
    })
  })

  it("options.globOnly", function(done){
    expand([
      '*.js',
      'abc.md'
    ], {
      cwd: fixtures,
      globOnly: true
    }, function (err, files) {
      expect(err).to.equal(null)
      expect(files.pop()).to.equal('abc.md')
      done()
    })
  })

  it("avoid duplication", function(done){
    expand([
      '*.js',
      '**/*.js'
    ], {
      cwd: fixtures
    }, function (err, files) {
      expect(err).to.equal(null)
      expect(files.sort()).to.deep.equal([
        'a.js',
        'b.js',
        'c.js'
      ])
      done()
    })
  })
})


describe("#29, filter async", function(){
  it("fs.Stats method name", function(done){
    expand([
      '*.js'
    ], {
      cwd: fixtures,
      filter: 'isDirectory'
    }, function (err, files) {
      expect(err).to.equal(null)
      expect(files).to.deep.equal(['b.js'])
      done()
    })
  })

  it("filter function", function(done){
    expand([
      '*.js'
    ], {
      cwd: fixtures,
      filter: function (src) {
        var done = this.async()
        fs.stat(src, function (err, stat) {
          if (err) {
            return done(err)
          }

          done(null, stat.isFile())
        })
      }
    }, function (err, files) {
      expect(err).to.equal(null)
      expect(files.sort()).to.deep.equal(['a.js', 'c.js'].sort())
      done()
    })
  })
})


describe("#29: sync filter", function(){
  it("fs.Stats method name", function(done){
    var files = expand.sync([
      '*.js'
    ], {
      cwd: fixtures,
      filter: 'isDirectory'
    })
    expect(files).to.deep.equal(['b.js'])
    done()
  })

  it("filter function", function(done){
    var files = expand.sync([
      '*.js'
    ], {
      cwd: fixtures,
      filter: function (src) {
        return fs.statSync(src).isFile()
      }
    })

    expect(files.sort()).to.deep.equal(['a.js', 'c.js'].sort())
    done()
  })
})
