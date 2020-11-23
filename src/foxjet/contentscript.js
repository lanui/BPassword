import logger from '../libs/logger';
import { getExtensionUrl } from '../libs/platforms/utils';
import { buildExtAppName } from '../libs/code-settings';
/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-23
 *    @comments: Firefox ContentScripts
 **********************************************************************/

global.__bpJetState = !1;
console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');
const p = document.createElement('p');
p.innerHTML = 'OKKKKKKKKK';
document.body.appendChild(p);
if (shouldInjectController()) {
  console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');
  logger.debug('>>>>>>>>>>>>>>>>>>>>>ok?>>>>>>>>>>>>.');
  logger.debug(`${buildExtAppName} inject scripts...`);
  injetStyles();
  // startup();
  injectScript();

  global.__bpJetState = !!1;
}

function injectScript() {
  const selector = document.querySelector('bp-selector-options');
  if (selector) {
    selector.setAttribute('tmd', 'ggggggg');
  }
}

function injetStyles() {
  const injetCss = getExtensionUrl('share/css/injet.css');
  try {
    logger.debug('>>>>>>>>>>>>>>>>>>>>>ok?>>>>>>>>>>>>.', injetCss);
    const container = document.head || document.documentElement;
    let style = document.createElement('link');

    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = injetCss;
    container.insertBefore(style, container.children[0]);

    log.debug(`${appName} inject css file[${injetCss}] success.`);
  } catch (err) {
    log.warn(`${appName} inject css file[${injetCss}] fail.`, err);
  }
}

function shouldInjectController() {
  return doctypeCheck() && suffixCheck() && domElementCheck();
}

function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === 'html';
  } else {
    return true;
  }
}

function domElementCheck() {
  const domEl = document.documentElement.nodeName;
  if (domEl) {
    return domEl.toLowerCase() === 'html';
  }
  return true;
}

function suffixCheck() {
  const uninjectTypes = [/\.xml$/, /\.pdf$/];

  const currentUrl = window.location.pathname;

  for (let i = 0; i < uninjectTypes.length; i++) {
    if (uninjectTypes[i].test(currentUrl)) {
      return false;
    }
  }

  return true;
}

async function domIsReady() {
  if (['interactive', 'complete'].includes(document.readyState)) {
    logger.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..o(*￣︶￣*)o');
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
