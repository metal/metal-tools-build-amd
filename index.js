'use strict';

var buildAmd = require('./lib/pipelines/buildAmd');
var consume = require('stream-consume');
var vfs = require('vinyl-fs');

module.exports = function (options) {
	options  = options || {};
	options.base = options.base || process.cwd();

	var stream = vfs.src(options.src || 'src/**/*.js', {base: options.base})
		.pipe(buildAmd(options))
		.pipe(vfs.dest(options.dest || 'build/amd'));
	consume(stream);
	return stream;
};
