'use strict';
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const chalk = require('chalk');
const merge = require('webpack-merge');
const webpack = require('webpack');

const { CheckVersion } = require('./copy-utils');

const { context, dist, src, manifest, R, ROOT_PATH } = require('./paths');

/**
 * Make sure build on Firefox
 * 1. set EXT_TARGET
 * 2. mixin env
 * 3. load baseConfig
 */
const providerEnv = require('../config/wrapper.env');
const baseConfig = require('./webpack.base');

const config = require('../config');
const isDev = providerEnv.NODE_ENV === 'development';

CheckVersion(providerEnv.EXT_TARGET);

// controller manifest import js
const isProd = providerEnv.NODE_ENV === 'production';

const { COMM_PATTERNS } = require('./copy-utils');
const crxManifest = require('../src/manifest-chrome.json');

console.log(
  chalk.blueBright('Build locale env>>>>>\n'),
  chalk.greenBright(JSON.stringify(providerEnv, '/n', 2))
);

/*********************************************************************
 * AircraftClass ::
 *    @description: Expand the Build configuration script to adapt to cross-browser build
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-20
 *    @comments:
 **********************************************************************/
let crxConfig = merge(baseConfig, {
  target: 'web',
  mode: providerEnv.NODE_ENV,
  entry: {
    contentscript: R(src, 'inpage/index.js'),
    'leech/leech': R(src, 'leechfox/leech.js'),
    'inpage/chanel5': R(src, 'inpage/chanel-five.js'),
    'inpage/cape7': R(src, 'inpage/cape-seven.js'),
    'inpage/top-injet': R(src, 'inpage/fox/top-injet.js'),
    'inpage/sub-injet': R(src, 'inpage/fox/sub-injet.js'),
  },
  plugins: [
    new webpack.DefinePlugin({
      __EXT_TARGET__: '"chrome"',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: manifest,
          to: R(dist, 'manifest.json'),
          transform: (content) => {
            let jsonContent = JSON.parse(content);
            jsonContent.name = providerEnv.APP_NAME;

            jsonContent.version = providerEnv.APP_VERSION;
            console.log('jsonContent.version:', chalk.red(jsonContent.version));
            jsonContent.author = providerEnv.APP_AUTHOR || '';

            jsonContent = { ...jsonContent, ...crxManifest };
            if (isDev) {
              jsonContent['content_security_policy'] =
                "script-src 'self' 'unsafe-eval'; object-src 'self';";
            } else {
            }
            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ],
    }),
  ],
});

if (process.env.HMR === 'true') {
  crxConfig.plugins = (crxConfig.plugins || []).concat([
    new ExtensionReloader({
      port: 9528,
      manifest: manifest,
      reloadPage: true,
      entries: {
        contentScript: ['contentscript', 'foxjet/top-injet', 'foxjet/sub-injet'],
        background: 'background',
      },
      extensionPage: ['popup/popup.html'],
    }),
  ]);
}

// module.exports = [foxConfig, foxjetConfig];
module.exports = crxConfig;
