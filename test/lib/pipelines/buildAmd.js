'use strict';

var assert = require('assert');
var buildAmd = require('../../../lib/pipelines/buildAmd');
var consume = require('stream-consume');
var path = require('path');
var sinon = require('sinon');
var vfs = require('vinyl-fs');

describe('Pipeline - Build AMD', function() {
	var originalCwd = process.cwd();

	before(function() {
		process.chdir('test/fixtures');
	});

	after(function() {
		process.chdir(originalCwd);
	});

	it('should build js files to multiple AMD modules and their source maps', function(done) {
		var stream = vfs.src('src/js/foo.js')
      .pipe(buildAmd({base: path.resolve()}));

    var files = [];
    stream.on('data', function(file) {
			files.push(file.relative);
		});
		stream.on('end', function() {
			assert.strictEqual(4, files.length);
			assert.deepEqual(
        [
          'dep/dep.js',
          'dep/dep.js.map',
          'metal/src/js/foo.js',
          'metal/src/js/foo.js.map'
        ],
        files.sort()
      );
			done();
		});
		consume(stream);
	});

	it('should build js files correctly when base folder doesn\'t contain node_modules', function(done) {
		var stream = vfs.src('src/js/foo.js')
      .pipe(buildAmd({base: path.resolve('src')}));

    var files = [];
    stream.on('data', function(file) {
			files.push(file.relative);
		});
		stream.on('end', function() {
			assert.strictEqual(4, files.length);
			assert.deepEqual(
        [
          'dep/dep.js',
          'dep/dep.js.map',
          'metal/js/foo.js',
          'metal/js/foo.js.map'
        ],
        files.sort()
      );
			done();
		});
		consume(stream);
	});

	it('should use given moduleName for the original source files', function(done) {
		var stream = vfs.src('src/js/foo.js')
      .pipe(buildAmd({base: path.resolve(), moduleName: 'foo'}));

    var files = [];
    stream.on('data', function(file) {
			files.push(file.relative);
		});
		stream.on('end', function() {
			assert.strictEqual(4, files.length);
			assert.deepEqual(
        [
          'dep/dep.js',
          'dep/dep.js.map',
          'foo/src/js/foo.js',
          'foo/src/js/foo.js.map'
        ],
        files.sort()
      );
			done();
		});
		consume(stream);
	});

	it('should normalize module path separators', function(done) {
		var stream = vfs.src('src/js/foo.js')
      .pipe(buildAmd({base: path.resolve(), moduleName: 'foo\\bar'}));

    var files = [];
    stream.on('data', function(file) {
			files.push(file.relative);
		});
		stream.on('end', function() {
			assert.strictEqual(4, files.length);
			assert.deepEqual(
        [
          'dep/dep.js',
          'dep/dep.js.map',
          'foo/bar/src/js/foo.js',
          'foo/bar/src/js/foo.js.map'
        ],
        files.sort()
      );
			done();
		});
		consume(stream);
	});

	it('should use import path as module id when it has the "module:" prefix', function(done) {
    // Supress error due to missing imported file.
    sinon.stub(console, 'warn');

		var stream = vfs.src('src/js/moduleAlias.js')
      .pipe(buildAmd({base: path.resolve()}));

    stream.on('data', function(file) {
      if (file.relative === 'metal/src/js/moduleAlias.js') {
        var contents = file.contents.toString();
        assert.notStrictEqual(-1, contents.indexOf('define([\'myModuleId\']'));
        console.warn.restore();
        done();
      }
		});
	});

  it('should preserve relative paths as module ids', function(done) {
    var stream = vfs.src('src/js/relativeImport.js')
      .pipe(buildAmd({base: path.resolve()}));

    stream.on('data', function(file) {
      if (file.relative === 'metal/src/js/relativeImport.js') {
        var contents = file.contents.toString();
        assert.notStrictEqual(-1, contents.indexOf('define([\'./foo\']'));
        done();
      }
    });
  });
});
