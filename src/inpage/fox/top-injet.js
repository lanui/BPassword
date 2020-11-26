import logger from '@lib/logger';
import { shouldActivedJet } from '../injet-helper';
import { LOG_LEVEL } from '@lib/code-settings';
import TopController from '../libs/top-controller';

import {
  API_FETCH_EXT_STATE,
  API_WIN_FINDED_LOGIN,
  API_WIN_SELECTOR_UP_VALT,
  API_WIN_SELECTOR_DRAWER,
} from '@lib/msgapi/api-types';
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

const posiChains = [];
const ifrCommunications = {};
if (shouldActivedJet()) {
  // logger.debug('BPassword is Development Mode.', LOG_LEVEL);
  const topCtx = new TopController({ type: 'BPTop_' });

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
        logger.debug('TopInjet:Message Listener->API_WIN_SELECTOR_DRAWER>>>>', data, controller);
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
