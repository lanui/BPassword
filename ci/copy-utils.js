const ejs = require('ejs');
const providerEnv = require('../config/wrapper.env');
const { R, src, dist } = require('./paths');

/*********************************************************************
 * AircraftClass :: Copy Utils
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-23
 *    @comments:
 **********************************************************************/
const COMM_PATTERNS = [
  { from: R(src, 'icons'), to: R(dist, 'icons'), globOptions: { ignore: ['**/icon.xcf'] } },
  { from: R(src, 'share'), to: R(dist, 'share') },
  { from: R(src, 'popup/popup.html'), to: R(dist, 'popup/popup.html'), transform: transformHtml },
];

function transformHtml(content) {
  return ejs.render(content.toString(), Object.assign({}, { ...providerEnv.env }, providerEnv));
}

module.exports = {
  COMM_PATTERNS,
  transformHtml,
};
