import logger from '@lib/logger';

import { shouldActivedJet } from './injet-helper';

import { API_FETCH_EXT_STATE } from '@lib/msgapi/api-types';
const browser = require('webextension-polyfill');

if (shouldActivedJet()) {
  // logger.debug('Inject source content:\n',source)
  // startup();
}

async function startup() {
  await domIsReady();
  const content = `
    /* BPassword Inject Source.*/ \n
  `;
  injetSource(content);
}

function injetSource(content) {
  logger.debug('BPassword Source start injecting....', content);
  try {
    const domContainer = document.head || document.documentElement;

    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.setAttribute('defer', 'defer');
    scriptEl.textContent = content;

    scriptEl.onload = function () {
      if (LOG_LEVEL !== 'DEBUG') {
        // this.parentNode.removeChild(this);
      }
    };

    domContainer.appendChild(scriptEl);
    logger.debug('BPassword Source inject completed.');
  } catch (error) {
    logger.debug('BPassword Source inject failed.', error);
  }
}

function fetchInitTopConfig() {
  browser.runtime
    .sendMessage({
      apiType: API_FETCH_EXT_STATE,
      reqData: { fetch: 'InjetExtInfo' },
    })
    .then((configState) => {
      logger.debug('fetchInitTopConfig  >>>>>>', configState);
    })
    .catch((err) => {
      logger.warn('BPassword failed.', err);
    });
}

async function domIsReady() {
  if (['interactive', 'complete'].includes(document.readyState)) {
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
