'use strict';

var expect = require('chai').expect;
var expand = require('../');

var node_path = require('path');

var fixtures = node_path.join(__dirname, 'fixtures');

describe("expand", function() {
  it("async", function(done) {
    expand([
      '*.js',
      '!c.js'
    ], {
      cwd: fixtures
    }, function(err, files) {
      expect(err).to.equal(null);
      expect(files.sort()).to.deep.equal([
        'a.js',
        'b.js'
      ]);
      done();
    });
  });

  it("sync", function() {
    var files = expand.sync([
      '*.js',
      '!c.js'
    ], {
      cwd: fixtures
    });

    expect(files.sort()).to.deep.equal([
      'a.js',
      'b.js'
    ]);
  });

  it("should maintain order", function(done){
    expand([
      '*.js',
      '*.md'
    ], {
      cwd: fixtures
    }, function (err, files) {
      expect(err).to.equal(null);
      expect(files.pop()).to.equal('README.md');
      done();
    });
  });

  it("options.globOnly", function(done){
    expand([
      '*.js',
      'abc.md'
    ], {
      cwd: fixtures,
      globOnly: true
    }, function (err, files) {
      expect(err).to.equal(null);
      expect(files.pop()).to.equal('abc.md');
      done();
    });
  });
});