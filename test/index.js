'use strict';

var assert = require('assert');
var bowerDirectory = require('bower-directory');
var del = require('del');
var fs = require('fs');
var metalToolsBuildAmd = require('../index');
var path = require('path');
var sinon = require('sinon');
var vfs = require('vinyl-fs');

describe('Metal Tools - Build AMD', function() {
  before(function() {
    sinon.stub(bowerDirectory, 'sync').returns('test/fixtures/bower');
  });

  after(function() {
    bowerDirectory.sync.restore();
  });

  describe('Default src/dest', function() {
    beforeEach(function() {
      var pipe = {
        pipe: function() {
          return pipe;
        }
      };
      sinon.stub(vfs, 'src').returns(pipe);
      sinon.stub(vfs, 'dest');
    });

    afterEach(function() {
      vfs.src.restore();
      vfs.dest.restore();
    });

  	it('should compile soy files from "src" and to "build/amd" by default', function() {
      metalToolsBuildAmd();
      assert.strictEqual('src/**/*.js', vfs.src.args[0][0]);
      assert.strictEqual('build/amd', vfs.dest.args[0][0]);
  	});
  });

  describe('Integration', function() {
    beforeEach(function(done) {
      deleteBuiltFiles(done);
    });

  	after(function(done) {
      deleteBuiltFiles(done);
  	});

  	it('should compile specified soy files to multiple AMD modules and source maps', function(done) {
      var stream = metalToolsBuildAmd({
        base: path.resolve('test/fixtures'),
        src: 'test/fixtures/js/foo.js',
        dest: 'test/fixtures/build'
      });
      stream.on('end', function() {
        assert.ok(fs.existsSync('test/fixtures/build/metal/js/foo.js'));
        assert.ok(fs.existsSync('test/fixtures/build/metal/js/foo.js.map'));
        assert.ok(fs.existsSync('test/fixtures/build/dep/dep.js'));
        assert.ok(fs.existsSync('test/fixtures/build/dep/dep.js.map'));
    		done();
      });
  	});
  });
});

function deleteBuiltFiles(done) {
  del('test/fixtures/build').then(function() {
    done();
  });
}
