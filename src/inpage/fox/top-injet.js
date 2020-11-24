import logger from '@lib/logger';
import { shouldActivedJet } from '../injet-helper';
import { LOG_LEVEL } from '@lib/code-settings';
import TopController from '../libs/top-controller';

import { API_WIN_FINDED_LOGIN } from '@lib/msgapi/api-types';

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
let extInfo = !1;

const posiChains = [];
const ifrCommunications = {};
if (shouldActivedJet()) {
  logger.debug('top script injected.>>>>>>>>>>>>>>>>>>');

  const controller = new TopController({});

  if (LOG_LEVEL === 'DEBUG') {
    global.tctx = controller;
  }
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

function startupInjet() {
  logger.debug('top script injected.>>>>>>>>>>>>>>>>>>');
}
