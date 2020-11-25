import logger from '@lib/logger';
import { shouldActivedJet } from '../injet-helper';
import { LOG_LEVEL } from '@lib/code-settings';
import TopController from '../libs/top-controller';

import { API_WIN_FINDED_LOGIN, API_FETCH_EXT_STATE } from '@lib/msgapi/api-types';
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

logger.debug('top script injected.>>>>>>>>>>>>>>>>>>');

const posiChains = [];
const ifrCommunications = {};
if (shouldActivedJet()) {
  logger.debug('top script injected.>>>>>>>>>>>>>>>>>>');

  const topCtx = new TopController({});
  global.topCtx = topCtx;

  if (LOG_LEVEL === 'DEBUG') {
    logger.warn('BPassword is Development Mode.', LOG_LEVEL);
    global.topCtx = topCtx;
  }

  // fetchInitTopConfig();
}

function startupTopJetMessageListener() {
  if (window.self !== window.top) {
    return;
  }

  window.addEventListener('message', function (messageEvt) {
    const msgData = messageEvt.data;
    logger.debug('FJS:topInjet received Message.>>>>>>>>>>>>>>>>>>', messageEvt);
    const { apiType } = msgData;

    switch (apiType) {
      case API_WIN_FINDED_LOGIN:
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
