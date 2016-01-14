'use strict';

var assert = require('assert');
var buildAmd = require('../../../lib/pipelines/buildAmd');
var consume = require('stream-consume');
var sinon = require('sinon');
var vfs = require('vinyl-fs');

describe('Pipeline - Build AMD', function() {
	it('should build js files to multiple AMD modules and their source maps', function(done) {
		var stream = vfs.src('test/fixtures/js/foo.js')
      .pipe(buildAmd());

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
          'metal/test/fixtures/js/foo.js',
          'metal/test/fixtures/js/foo.js.map'
        ],
        files.sort()
      );
			done();
		});
		consume(stream);
	});

	it('should use given moduleName for the original source files', function(done) {
		var stream = vfs.src('test/fixtures/js/foo.js')
      .pipe(buildAmd({moduleName: 'foo'}));

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
          'foo/test/fixtures/js/foo.js',
          'foo/test/fixtures/js/foo.js.map'
        ],
        files.sort()
      );
			done();
		});
		consume(stream);
	});

	it('should normalize module path separators', function(done) {
		var stream = vfs.src('test/fixtures/js/foo.js')
      .pipe(buildAmd({moduleName: 'foo\\bar'}));

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
          'foo/bar/test/fixtures/js/foo.js',
          'foo/bar/test/fixtures/js/foo.js.map'
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

		var stream = vfs.src('test/fixtures/js/moduleAlias.js')
      .pipe(buildAmd());

    stream.on('data', function(file) {
      if (file.relative === 'metal/test/fixtures/js/moduleAlias.js') {
        var contents = file.contents.toString();
        assert.notStrictEqual(-1, contents.indexOf('define([\'myModuleId\']'));
        console.warn.restore();
        done();
      }
		});
	});

  it('should preserve relative paths as module ids', function(done) {
    var stream = vfs.src('test/fixtures/js/relativeImport.js')
      .pipe(buildAmd());

    stream.on('data', function(file) {
      if (file.relative === 'metal/test/fixtures/js/relativeImport.js') {
        var contents = file.contents.toString();
        assert.notStrictEqual(-1, contents.indexOf('define([\'./foo\']'));
        done();
      }
    });
  });
});
