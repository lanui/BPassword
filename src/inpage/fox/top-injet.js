import logger from '@lib/logger';
import { shouldActivedJet } from '../injet-helper';
import { LOG_LEVEL } from '@lib/code-settings';

import TopController from '../libs/top-controller';

import { BPASS_SELECTOR_TAG, BpassSelector } from '../libs/bpass-selector';

import {
  API_FETCH_EXT_STATE,
  API_WIN_FINDED_LOGIN,
  API_WIN_SELECTOR_UP_VALT,
  API_WIN_SELECTOR_DRAWER,
} from '@lib/msgapi/api-types';

import { LEECH_INDEX_PATH, LEECH_ADDOR_PATH } from '@lib/messages/fox/extension-info';
import browser from 'webextension-polyfill';

/*********************************************************************
 * AircraftClass ::
 *    @description: extInfo
 *    @description: posiChains
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-24
 *    @comments:
 **********************************************************************/
if (window.top === window.self) {
  try {
    window.customElements.define(BPASS_SELECTOR_TAG, BpassSelector);
  } catch (err) {
    logger.warn('Top Registing custom.', err);
  }
}

if (shouldActivedJet()) {
  const initConfig = {
    extid: browser.runtime.id,
    leechSrc: browser.runtime.getURL(LEECH_INDEX_PATH),
    leechAddorSrc: browser.runtime.getURL(LEECH_ADDOR_PATH),
  };
  logger.debug('BPassword Top initConfig:', JSON.stringify(initConfig));
  const topCtx = new TopController({ initConfig });

  if (LOG_LEVEL === 'DEBUG') {
    /** This code in firefox unhelp debug */
    // logger.debug('BPassword is Development Mode.2', LOG_LEVEL);
    global.topCtx = topCtx;
  }

  startupTopJetMessageListener(topCtx);

  // fetchInitTopConfig();
}

function startupTopJetMessageListener(controller) {
  if (window.self !== window.top) {
    return;
  }

  window.addEventListener('message', (evt) => {
    const recMessage = evt.data;

    if (!recMessage && !recMessage.apiType) {
      /** only handle BPassword Message. */
      return;
    }

    const { apiType, data } = recMessage;
    logger.debug('FJS:topInjet received Message.>>>>>>>>>>>>>>>>>>', data);

    switch (apiType) {
      case API_WIN_FINDED_LOGIN:
        controller.updatefindedMessageHandler(data);
        logger.debug('TopInjet:Message Listener->API_WIN_FINDED_LOGIN>>>>', controller);
        break;
      case API_WIN_SELECTOR_UP_VALT:
        /**
         * TODO
         * Top hold login fields value will remove
         * because the iframe height calculation completed at inner iframe.
         */
        controller.updateFieldValtStoreHandler(data);
        logger.debug(
          'TopInjet:Message Listener->API_WIN_SELECTOR_UP_VALT>>>>',
          controller.fieldValtState.getState()
        );
        break;
      case API_WIN_SELECTOR_DRAWER:
        /** */
        // logger.debug('TopInjet:Message Listener->API_WIN_SELECTOR_DRAWER>>>>', data, controller);
        controller.drawingSelector(data);
        break;

      default:
        break;
    }
  });
}

async function fetchInitTopConfig() {
  try {
    const topConfState = await browser.runtime.sendMessage({
      apiType: API_FETCH_EXT_STATE,
      reqData: { fetch: 'topInjet' },
    });
    logger.debug('top script injected.>>>>>>>>>>>>>>>>>>', topConfState);
  } catch (error) {
    logger.debug('top script injected.error>>>>>>>>>>>>>>>>>>', error);
  }
}

function startupInjet() {
  logger.debug('top script injected.>>>>>>>>>>>>>>>>>>');
}
