'use strict';
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
.BundleAnalyzerPlugin;
const webpack = require('webpack');

const { context, dist, src, manifest, R, ROOT_PATH } = require('./paths');

const providerEnv = require('../config/wrapper.env');

const isDev = providerEnv.NODE_ENV === 'development';

const config = require('../config');
const { COMM_PATTERNS } = require('./copy-utils');

/**********************************\***********************************

- AircraftClass ::
- @description: Expand the Build configuration script to adapt to cross-browser build
- @description:
- WARNINGS:
-
- HISTORY:
- @author: lanbery@gmail.com
- @created: 2020-11-20
- @comments:
  **********************************\*\***********************************/
  let baseConfig = {
  context: context,
  entry: {
  background: R(src, './background.js'),
  'popup/popup': R(src, './popup/popup.js'),
  },
  output: {
  path: dist,
  filename: '[name].js',
  },
  resolve: {
  extensions: ['.js', '.vue'],
  alias: {
  '@': src,
  '@lib': R(src, 'libs'),
  '@ui': R(src, 'ui'),
  '@p3': R(src, 'popup'),
  },
  },
  optimization:{
  minimize: true,
  splitChunks:{
  chunks:"all",
  name:false,
  cacheGroups:{
  commons: {
  chunks:"initial",
  minChunks:2,
  name:"commons",
  maxInitialRequests:5,
  minSize: 0,//默认是 30kb，minSize 设置为 0 之后,多次引用的会被压缩到 commons 中
  },
  "ui-vuetify":{
  test: (module) => {
  // console.log("Chunks ------------------>",module)
  return /vuetify/.test(module.context);
  },
  chunks: "initial",
  name: "ui-vuetify",
  priority: 11
  },
  "ui-vendors": {
  test:(module) =>{
  // console.log("Chunks ------------------>",module)
  return /vue|vuex|vue-i18n|vue-router/.test(module.context);
  },
  chunks:"initial",
  name:"ui-vendors",
  priority:10
  }
  }
  }
  },
  externals:{
  // vue: "Vue",
  // "vue-router": "VueRouter",
  // "vue-i18n": "VueI18n",
  // vuex: "Vuex",
  // vuetify:"Vuetify",
  // lodash: {
  // commonjs: "lodash",
  // amd: "lodash",
  // root: "\_" // 指向全局变量
  // },
  // web3: "Web3",
  },
  module: {
  rules: [
  {
  test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
  loader: 'babel-loader',
  exclude: [/node_modules/],
  },
  {
  test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.sass$/,
  use: [
  'vue-style-loader',
  'css-loader',
  {
  loader: 'sass-loader',
  options: {
  implementation: require('sass'),
  sassOptions: {
  fiber: require('fibers'),
  indentedSyntax: true,
  },
  additionalData: "@import '@/styles/variables.scss'",
  },
  },
  ],
  },
  {
  test: /\.scss$/,
        // use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
                indentedSyntax: true,
              },
              additionalData: "@import '@/styles/variables.scss';",
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
  loader: 'file-loader',
  options: {
  name: '[path][name].[ext]',
  outputPath: '/images/',
  emitFile: true,
  esModule: false,
  },
  },
  {
  test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: '/fonts/',
          emitFile: true,
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
      __EXT_TARGET__: JSON.stringify(providerEnv.EXT_TARGET),
      __EXT_NAME__: JSON.stringify(providerEnv.APP_NAME),
      __EXT_VERION__: JSON.stringify(providerEnv.APP_VERSION),
      'process.env.APP_NAME': JSON.stringify(providerEnv.APP_NAME),
    }),
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
  new VueLoaderPlugin(),
  new MiniCssExtractPlugin({
  filename: '[name].css',
  }),
  new CopyPlugin({
  patterns: [...COMM_PATTERNS],
  }),
  new VuetifyLoaderPlugin({
  match(originalTag, { kebabTag, camelTag, path, component }) {
  if (kebabTag.startsWith('core-')) {
  return [
  camelTag,
  `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`,
  ];
  }
  },
  }),
  ],
  };

// https://webpack.js.org/configuration/devtool/#development
if (isDev) {
baseConfig.devtool = config.devtool;
baseConfig.plugins = (baseConfig.plugins || []).concat([
new webpack.DefinePlugin({
__LOG_LEVEL__: JSON.stringify(providerEnv.LOG_LEVEL || 'WARN'),
'process.env.NODE_ENV': '"development"',
}),
new BundleAnalyzerPlugin({
analyzerPort:8899,
reportFilename:R('dist'),
generateStatsFile:true
})
]);

} else {
baseConfig.plugins = (baseConfig.plugins || []).concat([
new webpack.DefinePlugin({
__LOG_LEVEL__: JSON.stringify(providerEnv.LOG_LEVEL || 'WARN'),
'process.env.NODE_ENV': '"production"',
}),
]);
}

module.exports = baseConfig;
