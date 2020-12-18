const path = require('path');

const ROOT_PATH = process.cwd();
const providerEnv = require('../config/wrapper.env');
const R = (...p) => path.resolve(__dirname, '../', ...p);

const targetPath = providerEnv.EXT_TARGET || 'chrome';
module.exports = {
  context: path.resolve(__dirname, '../'),
  dist: path.resolve(__dirname, '../dist', targetPath),
  distzip: path.resolve(__dirname, '../dist-zip'),
  src: path.resolve(__dirname, '../src'),
  manifest: path.resolve(__dirname, '../src/manifest.json'),
  R,
  ROOT_PATH,
  targetPath,
};
