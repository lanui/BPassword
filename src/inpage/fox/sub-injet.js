import { nanoid } from 'nanoid';

import logger from '@lib/logger';
import { LOG_LEVEL } from '@lib/code-settings';
import { shouldActivedJet } from '../injet-helper';
import { BPASS_BUTTON_TAG, BpassButton } from '../libs/bpass-button';

import FieldController from '../libs/field-controller';

const browser = require('webextension-polyfill');

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-24
 *    @comments:
 **********************************************************************/
if (window.top === window.self) {
  try {
    window.customElements.define(BPASS_BUTTON_TAG, BpassButton);
    logger.warn('Sub Registing custom elements.', window.customElements.get(BPASS_BUTTON_TAG));
  } catch (err) {
    logger.warn('Sub Registing custom elements.', err);
  }
}
if (shouldActivedJet()) {
  const extid = browser.runtime.id;

  startup(extid).catch((err) => {
    logger.warn('SubJetStartup failed.', err);
  });
}

/**
 * subInjet Startup
 */
async function startup(extid) {
  //make sure dom element rendered
  await domIsReady();

  //
  const controller = new FieldController({ extid });
  // logger.debug('Sub script injected.>>>>>>>>>>>>>>>>>>', LOG_LEVEL, extid);
  if (LOG_LEVEL === 'DEBUG') {
    window.fctx = controller;
  }
  controller.checkLoginForm();
}

function startupInjet() {
  logger.debug('Sub script injected.>>>>>>>>>>>>>>>>>>');
}

async function domIsReady() {
  if (['interactive', 'complete'].includes(document.readyState)) {
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
