const pkgJson = require('../package.json');

const isProd = process.env.NODE_ENV === 'production';

const localEnv = isProd ? require('./.prod.env.js') : require('./.dev.env.js');

const mixinProperty = (key, defaultValue = '') => {
  return process.env[key] || localEnv[key] || defaultValue;
};

const PKG_VERSION = pkgJson.version || '2.0.0';

/**
 *
 */
module.exports = {
  APP_NAME: mixinProperty('APP_NAME', 'BPassword'),
  APP_VERSION: mixinProperty('APP_VERSION', PKG_VERSION),
  APP_AUTHOR: process.env.APP_AUTHOR || pkgJson.author,
  INFURA_PROJECTID: mixinProperty('INFURA_PROJECTID', ''),
  INFURA_SECRET: mixinProperty('INFURA_SECRET', ''),
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: mixinProperty('LOG_LEVEL', 'WARN'),
  FOX_KEY: localEnv.FOX_KEY,
  FOX_ID: localEnv.FOX_ID,
  EXT_TARGET: mixinProperty('EXT_TARGET', 'chrome'),
};
