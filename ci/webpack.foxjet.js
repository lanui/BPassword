const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ExtensionReloader = require('webpack-extension-reloader');

const { context, dist, src, manifest, R, ROOT_PATH } = require('./paths');
const providerEnv = require('../config/wrapper.env');
const isDev = process.env.NODE_ENV === 'development';
const config = require('../config');

const foxjetConfig = {
  target: 'web',
  mode: providerEnv.NODE_ENV,
  context: R(src, 'foxjet'),
  entry: {
    contentscript: R(src, 'foxjet/contentscript.js'),
    'foxjet/top-injet': R(src, 'foxjet/top-injet.js'),
    'foxjet/sub-injet': R(src, 'foxjet/sub-injet.js'),
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
    },
  },
  module: {
    rules: [
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
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: '/images/',
          emitFile: true,
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
    }),
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
};

if (isDev) {
  foxjetConfig.devtool = config.devtool;
  foxjetConfig.plugins = (foxjetConfig.plugins || []).concat([
    new webpack.DefinePlugin({
      __LOG_LEVEL__: JSON.stringify(providerEnv.LOG_LEVEL || 'WARN'),
      'process.env.NODE_ENV': '"development"',
    }),
  ]);
} else {
  foxjetConfig.plugins = (foxjetConfig.plugins || []).concat([
    new webpack.DefinePlugin({
      __LOG_LEVEL__: JSON.stringify(providerEnv.LOG_LEVEL || 'WARN'),
      'process.env.NODE_ENV': '"production"',
    }),
  ]);
}

module.exports = foxjetConfig;
