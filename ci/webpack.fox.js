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
// let foxConfig = {
//   mode: providerEnv.NODE_ENV,
//   context: context,
//   entry: {
//     "background": R(src, './background.js'),
//     "popup/popup": R(src, './popup/popup.js'),
//   },
//   output: {
//     path: dist,
//     filename: '[name].js',
//   },
//   resolve: {
//     extensions: ['.js', '.vue'],
//     alias: {
//       '@': src,
//       '@lib': R(src, 'libs'),
//       '@ui': R(src, 'ui'),
//       '@p3': R(src, 'popup'),
//     }
//   },
//   module: {
//     rules: [
//       {
//         test: /\.vue$/,
//         loader: 'vue-loader',
//       },
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         exclude: [/node_modules/],
//       },
//       {
//         test: /\.css$/,
//         use: [MiniCssExtractPlugin.loader, 'css-loader'],
//       },
//       {
//         test: /\.sass$/,
//         use: [
//           'vue-style-loader',
//           'css-loader',
//           {
//             loader: 'sass-loader',
//             options: {
//               implementation: require('sass'),
//               sassOptions: {
//                 fiber: require('fibers'),
//                 indentedSyntax: true,
//               },
//               additionalData: "@import '@/styles/variables.scss'",
//             },
//           },
//         ],
//       },
//       {
//         test: /\.scss$/,
//         // use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
//         use: [
//           'vue-style-loader',
//           'css-loader',
//           {
//             loader: 'sass-loader',
//             options: {
//               implementation: require('sass'),
//               sassOptions: {
//                 fiber: require('fibers'),
//                 indentedSyntax: true,
//               },
//               additionalData: "@import '@/styles/variables.scss';",
//             },
//           },
//         ],
//       },
//       {
//         test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
//         loader: 'file-loader',
//         options: {
//           name: '[path][name].[ext]',
//           outputPath: '/images/',
//           emitFile: true,
//           esModule: false,
//         },
//       },
//       {
//         test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
//         loader: 'file-loader',
//         options: {
//           name: '[path][name].[ext]',
//           outputPath: '/fonts/',
//           emitFile: true,
//           esModule: false,
//         },
//       },
//     ],
//   },
//   plugins: [
//     new webpack.DefinePlugin({
//       global: 'window',
//       __EXT_TARGET__: JSON.stringify(providerEnv.EXT_TARGET),
//       __EXT_NAME__: JSON.stringify(providerEnv.APP_NAME),
//       __EXT_VERION__: JSON.stringify(providerEnv.APP_VERSION),
//       'process.env.APP_NAME': JSON.stringify(providerEnv.APP_NAME),
//     }),
//     new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
//     new VueLoaderPlugin(),
//     new MiniCssExtractPlugin({
//       filename: '[name].css',
//     }),
//     new CopyPlugin({
//       patterns: [
//         ...COMM_PATTERNS,
//         {
//           from: manifest,
//           to: R(dist, 'manifest.json'),
//           transform: (content) => {
//             let jsonContent = JSON.parse(content);
//             jsonContent.name = providerEnv.APP_NAME;
//             jsonContent.version = providerEnv.APP_VERSION;
//             jsonContent.author = providerEnv.APP_AUTHOR || '';

//             if (jsonContent['browser_action']) {
//               jsonContent['browser_action']['default_title'] = providerEnv.APP_NAME;
//             }

//             jsonContent = { ...jsonContent, ...foxManifest };

//             if (isDev) {
//               jsonContent['content_security_policy'] =
//                 "script-src 'self' 'unsafe-eval'; object-src 'self'";
//             }

//             return JSON.stringify(jsonContent, null, 2);
//           },
//         }
//       ]
//     }),
//     new VuetifyLoaderPlugin({
//       match(originalTag, { kebabTag, camelTag, path, component }) {
//         if (kebabTag.startsWith('core-')) {
//           return [
//             camelTag,
//             `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`,
//           ];
//         }
//       },
//     }),
//   ]
// }

// // https://webpack.js.org/configuration/devtool/#development
// if (isDev) {
//   foxConfig.devtool = config.devtool
//   foxConfig.plugins = (foxConfig.plugins || []).concat([
//     new webpack.DefinePlugin({
//       __LOG_LEVEL__: JSON.stringify(providerEnv.LOG_LEVEL || 'WARN'),
//       'process.env.NODE_ENV': '"development"',
//     })
//   ])
// } else {
//   foxConfig.plugins = (foxConfig.plugins || []).concat([
//     new webpack.DefinePlugin({
//       __LOG_LEVEL__: JSON.stringify(providerEnv.LOG_LEVEL || 'WARN'),
//       'process.env.NODE_ENV': '"production"',
//     })
//   ])
// }

// if (process.env.HMR === 'true') {
//   foxConfig.plugins = (foxConfig.plugins || []).concat([
//     new ExtensionReloader({
//       port: 9528,
//       manifest: manifest,
//       reloadPage: true,
//       entries: {
//         contentScript: [],
//         background: 'background',
//       },
//       extensionPage: ['popup/popup.html'],
//     }),
//   ]);
// }

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
                "script-src 'self' 'unsafe-eval'; object-src 'self'";
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

module.exports = foxConfig;
