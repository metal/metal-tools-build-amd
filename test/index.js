'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var metalToolsBuildAmd = require('../index');
var sinon = require('sinon');
var vfs = require('vinyl-fs');

describe('Metal Tools - Build AMD', function() {
  var originalCwd = process.cwd();

  before(function() {
    process.chdir('test/fixtures');
  });

  after(function() {
    process.chdir(originalCwd);
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
        base: process.cwd(),
        src: 'js/foo.js',
        dest: 'build'
      });
      stream.on('end', function() {
        assert.ok(fs.existsSync('build/metal/js/foo.js'));
        assert.ok(fs.existsSync('build/metal/js/foo.js.map'));
        assert.ok(fs.existsSync('build/dep/dep.js'));
        assert.ok(fs.existsSync('build/dep/dep.js.map'));
    		done();
      });
  	});
  });
});

function deleteBuiltFiles(done) {
  del('build').then(function() {
    done();
  });
}
