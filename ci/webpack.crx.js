'use strict';
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

const merge = require('webpack-merge');

const webpack = require('webpack');

const { context, dist, src, manifest, R, ROOT_PATH } = require('./paths');
const providerEnv = require('../config/wrapper.env');
const baseConfig = require('./webpack.base');
const config = require('../config');
const isDev = providerEnv.NODE_ENV === 'development';
const { COMM_PATTERNS } = require('./copy-utils');
const crxManifest = require('../config/manifest-chrome.json');

console.log(
  `Build locale env ${providerEnv.EXT_TARGET}>>>>>`,
  JSON.stringify(providerEnv, '/n', 2)
);

let crxConfig = merge(baseConfig, {
  mode: providerEnv.NODE_ENV,
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
            jsonContent.author = providerEnv.APP_AUTHOR || '';

            if (isDev) {
              jsonContent['content_security_policy'] =
                "script-src 'self' 'unsafe-eval'; object-src 'self'";
            }

            jsonContent = { ...jsonContent, ...crxManifest };
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
        contentScript: [],
        background: 'background',
      },
      extensionPage: ['popup/popup.html'],
    }),
  ]);
}

module.exports = crxConfig;
