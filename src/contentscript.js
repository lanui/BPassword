import '@webcomponents/custom-elements';
import PageMessageDuplexStream from 'post-message-stream';

import * as log from 'loglevel';
import { LOG_LEVEL } from './injet/settings';

import { getExtensionUrl, getExtName } from './libs/platforms/utils';
import { getUUID } from './injet/inpage/comm-utils';

import { COMMUNICATION_CONTENTSCRIPT_NAME, COMMUNICATION_INJET_TOP_NAME } from './libs/enums';
import logger from './libs/logger';

global.injetState = !1;
log.setLevel(LOG_LEVEL);

const appName = getExtName();

if (shouldInjectController()) {
  injectScript();
  startup();
}

/**
 * inject scripts and css
 */
function injectScript() {
  injectStyles();
  const MSG_TOPIC_FINDED = `topic_finded_${getUUID()}`;
  if (window.top === window.self) {
    injectTop();
  } else {
    //
  }
  inject();
}

async function startup() {
  const injetState = {
    extid: chrome.runtime.id,
  };

  // log.debug('BP dom >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', injetState);
  await domIsReady();
  // console.log('BP dom ready.(oﾟ▽ﾟ)o ')
}

async function setupStream() {
  const pageStream = new PageMessageDuplexStream({
    name: COMMUNICATION_CONTENTSCRIPT_NAME,
    target: COMMUNICATION_INJET_TOP_NAME,
  });
}

function injectStyles() {
  const injetCss = getExtensionUrl('share/css/injet.css');
  try {
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

async function injectTop() {
  const injetUrl = getExtensionUrl('injet/injet-top.js');

  try {
    if (window.top !== window.self) {
      logger.debug('I will not inject.because I am not top.');
      return;
    }
    const container = document.head || document.documentElement;
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.src = injetUrl;

    scriptEl.onload = function () {
      this.parentNode.removeChild(this);
    };
    container.appendChild(scriptEl);
    log.debug(`${appName} inject top script[${injetUrl}] success.`);
  } catch (error) {
    log.warn(`${appName} inject top script [${injetUrl}] fail.`, error);
  }
}

async function inject() {
  const injetUrl = getExtensionUrl('injet/injet.js');

  try {
    const container = document.head || document.documentElement;
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.src = injetUrl;

    scriptEl.onload = function () {
      this.parentNode.removeChild(this);
    };
    container.appendChild(scriptEl);
    log.debug(`${appName} inject script[${injetUrl}] success.`);

    //
    const extid = chrome.runtime.id;
    // logger.debug('Inject Contentscript>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', extid);
    const body = document.querySelector('body');
    if (body) {
      body.setAttribute('_bp-extid', extid);
      const scriptExtEl = document.createElement('script');

      scriptExtEl.textContent = `
        window.bp_ext_id = \"${extid}\";
      `;
      scriptExtEl.onload = function () {
        this.parentNode.removeChild(this);
      };

      body.appendChild(scriptExtEl);
    }
  } catch (error) {
    log.warn(`${appName} inject script [${injetUrl}] fail.`, error);
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
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
