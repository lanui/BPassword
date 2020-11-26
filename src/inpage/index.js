import logger from '@lib/logger';

import { shouldActivedJet } from './injet-helper';

import { API_FETCH_EXT_STATE } from '@lib/msgapi/api-types';
const browser = require('webextension-polyfill');

if (shouldActivedJet()) {
  fetchInitTopConfig();

  // logger.debug("webextension-polyfill>>>>>>>>>>>>>>>>>.",browser.runtime.id)

  // const topSrc = browser.runtime.getURL('inpage/top-injet.js')
  // injectEntryJs(topSrc,true)

  // const subSrc = browser.runtime.getURL('inpage/sub-injet.js')
  // injectEntryJs(subSrc, false)
}

function fetchInitTopConfig() {
  browser.runtime
    .sendMessage({
      apiType: API_FETCH_EXT_STATE,
      reqData: { fetch: 'InjetExtInfo' },
    })
    .then((configState) => {
      injetExtInfo(configState);
    })
    .catch((err) => {
      logger.warn('BPassword failed.', err);
    });
}

function injetExtInfo(configState) {
  const serialize = JSON.stringify(configState);
  const bpConfigInjetContent = `
      (function(configSerialize){
        if(configSerialize){
          const config = JSON.parse(configSerialize)
          window.__bp_extconfig = config
        }
      })('${serialize}')
    `;
  try {
    const domContainer = document.head || document.documentElement;

    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.setAttribute('defer', 'defer');
    scriptEl.textContent = bpConfigInjetContent;

    scriptEl.onload = function () {
      if (LOG_LEVEL !== 'DEBUG') {
        // this.parentNode.removeChild(this);
      }
    };

    domContainer.appendChild(scriptEl);
    logger.debug('inject ext message success.');
  } catch (error) {
    logger.debug('inject ext message failed.', error);
  }
}

/**
 *
 * @param {*} injectSrc
 * @param {*} isTop
 */
function injectEntryJs(injectSrc, isTop) {
  if (isTop) {
    if (window.top !== window.self) {
      logger.debug('Inner window unnneed injet top controller js');
      return;
    }
  }
  try {
    logger.debug(`injet ${isTop ? 'top' : 'sub'} controller js starting...`, injectSrc);
    const container = document.head || document.documentElement;

    const commonSrc = browser.runtime.getURL('commons.js');

    let lookup = container.querySelector('script[src="${commonSrc}"]');
    if (!lookup) {
      const libEl = document.createElement('script');
      libEl.setAttribute('async', 'false');
      libEl.setAttribute('defer', 'defer');
      libEl.src = injectSrc;

      libEl.onload = function () {
        // this.parentNode.removeChild(this);
      };
      libEl.appendChild(scriptEl);
    }

    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.setAttribute('defer', 'defer');
    scriptEl.src = injectSrc;

    scriptEl.onload = function () {
      // this.parentNode.removeChild(this);
    };
    container.appendChild(scriptEl);

    logger.debug(`injet ${isTop ? 'top' : 'sub'} controller js completed.`);
  } catch (err) {
    logger.warn(
      `injet ${isTop ? 'top' : 'sub'} controller js failed.BPassword Features Maybe can not used.`,
      err
    );
  }
}

async function startup() {
  await domIsReady();

  global.BPassword = 'ok';
}

async function domIsReady() {
  if (['interactive', 'complete'].includes(document.readyState)) {
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
