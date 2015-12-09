'use strict';

var babelPresetMetal = require('babel-preset-metal');

module.exports = {
  babelPresets: [babelPresetMetal],
  base: process.cwd(),
  moduleName: 'metal'
};
