import TopController from './inpage/top-controller';
import logger from '@/libs/logger';

import { SELECTOR_OPTIONS_TAG, SelectorOptions } from './inpage/selector-options';
import { LOG_LEVEL } from '@/libs/code-settings';

import {
  API_WIN_SELECTOR_DRAWER,
  API_WIN_SELECTOR_UP_DRAWER,
  API_WIN_SELECTOR_TOGGLE,
  API_WIN_SELECTOR_ERASER,
  API_WIN_SELECTOR_ERASER_FORCE,
  API_WIN_SELECTOR_UP_POSITION,
  API_WIN_FINDED_LOGIN,
  API_WIN_SELECTOR_UP_HEIGHT,
  API_WIN_SELECTOR_UP_VALT,
} from '@/libs/msgapi/api-types.js';

/**
 * has capability:
 * runtime.sendMessage
 * getURL
 * id
 */
startupLeech()
  .then((resp) => {})
  .catch((error) => {
    logger.warn('startupLeech failed.', error);
  });

/**
 *
 */
async function startupLeech() {
  window.customElements.define(SELECTOR_OPTIONS_TAG, SelectorOptions);
  const controller = new TopController();

  if (LOG_LEVEL === 'DEBUG') {
    global.tctx = controller;
  }

  await domIsReady();

  window.addEventListener('message', function (event) {
    const message = event.data;
    // logger.debug('Top injet REC MSG:>>>>>>', message);
    if (message.apiType) {
      logger.debug('Top injet REC MSG:>>>>>>', message.apiType, JSON.stringify(message));
      switch (message.apiType) {
        case API_WIN_FINDED_LOGIN:
          controller.findedLoginFeildsInitTopInfo(message);
          break;
        case API_WIN_SELECTOR_DRAWER:
          controller.drawSelector(message);
          break;
        case API_WIN_SELECTOR_UP_DRAWER:
          controller.drawSelectorOrUpdate(message.data);
          break;
        case API_WIN_SELECTOR_TOGGLE:
          controller.toggleSelector(message);
          break;
        case API_WIN_SELECTOR_ERASER:
          controller.eraserSelector();
          break;
        case API_WIN_SELECTOR_ERASER_FORCE:
          controller.eraserSelector(true);
          break;
        case API_WIN_SELECTOR_UP_POSITION:
          controller.updateSelectorPosition(message);
          break;
        case API_WIN_SELECTOR_UP_HEIGHT:
          controller.setAddPageHeight(message);
          break;
        case API_WIN_SELECTOR_UP_VALT:
          if (message.data) {
            controller.updateValStoreFromLoginForm(message.data);
          }
          break;
        default:
          break;
      }
    }
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
