'use strict';

var buildAmd = require('./lib/pipelines/buildAmd');
var consume = require('stream-consume');
var defaultOptions = require('./lib/options');
var merge = require('merge');
var vfs = require('vinyl-fs');
var rename = require("gulp-rename");

module.exports = function (options) {
	options = merge({}, defaultOptions, options);
	var stream = vfs.src(options.src || 'src/**/*.js', {base: options.base})
		.pipe(buildAmd(options))
		.pipe(rename(function(filePath) {
			filePath.dirname = filePath.dirname.replace(/(\.\.\/)+node_modules\//g, '');
		}))
		.pipe(vfs.dest(options.dest || 'build/amd', {}));
	consume(stream);
	return stream;
};
