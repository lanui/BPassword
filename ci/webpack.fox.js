'use strict';
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const chalk = require('chalk');
const merge = require('webpack-merge');
const webpack = require('webpack');

const { context, dist, src, manifest, R, ROOT_PATH } = require('./paths');
const { CheckVersion } = require('./copy-utils');

/**
 * Make sure build on Firefox
 * 1. set EXT_TARGET
 * 2. mixin env
 * 3. load baseConfig
 */
const providerEnv = require('../config/wrapper.env');
const baseConfig = require('./webpack.base');

const config = require('../config');

CheckVersion(providerEnv.EXT_TARGET);

const isDev = providerEnv.NODE_ENV === 'development';

// controller manifest import js
const isProd = providerEnv.NODE_ENV === 'production';

const { COMM_PATTERNS } = require('./copy-utils');
const foxManifest = require('../src/manifest-fox.json');

console.log('Build locale env>>>>>', JSON.stringify(providerEnv, '/n', 2));

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
let foxConfig = merge(baseConfig, {
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
      __EXT_TARGET__: '"firefox"',
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

            jsonContent = { ...jsonContent, ...foxManifest };

            if (isDev) {
              jsonContent['content_security_policy'] =
                "script-src 'self' 'unsafe-eval'; object-src 'self';";
            } else {
              jsonContent['content_security_policy'] =
                "script-src 'self' 'unsafe-eval'; object-src 'self';";
            }

            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ],
    }),
  ],
});

if (process.env.HMR === 'true') {
  foxConfig.plugins = (foxConfig.plugins || []).concat([
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

  /** ContentScript */

  const foxjetConfig = require('./webpack.foxjet.js');

  // foxjetConfig.plugins = (foxjetConfig.plugins || []).concat([
  //   new ExtensionReloader({
  //     port: 9527,
  //     reloadPage: false,

  //     entries: {
  //       contentScript: ["contentscript", "foxjet/top-injet","foxjet/sub-injet"],
  //     },
  //   }),
  // ]);
}

// module.exports = [foxConfig, foxjetConfig];
module.exports = foxConfig;
