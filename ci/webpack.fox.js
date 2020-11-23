'use strict';
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

const merge = require('webpack-merge');
const webpack = require('webpack');

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

// controller manifest import js
const isProd = providerEnv.NODE_ENV === 'production';

const { COMM_PATTERNS } = require('./copy-utils');
const foxManifest = require('../config/manifest-fox.json');

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
  mode: providerEnv.NODE_ENV,
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
            jsonContent.author = providerEnv.APP_AUTHOR || '';

            if (isDev) {
              jsonContent['content_security_policy'] =
                "script-src 'self' 'unsafe-eval'; object-src 'self';img-src 'self'";
            }

            jsonContent = { ...jsonContent, ...foxManifest };
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
        contentScript: [],
        background: 'background',
      },
      extensionPage: ['popup/popup.html'],
    }),
  ]);
}
// "externally_connectable": {
//   "ids": ["*"],
//     "matchex": ["*://moz-extension/*"]
// },
module.exports = foxConfig;
