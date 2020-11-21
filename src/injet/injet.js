import logger from '@/libs/logger';
import FeildController from './inpage/feild-controller';
import { BPASS_BUTTON_TAG, BpassButton } from './inpage/bpass-button';
import { LOG_LEVEL } from './settings';

startupInjet()
  .then((resp) => {
    const { controller, injetState } = resp;
    // logger.debug('>>>>>>Injet sub>>>>>>>>>>>>>>>>>>', controller, injetState)
  })
  .catch((err) => {
    logger.warn('startup fail.', err);
  });

async function startupInjet() {
  await domIsReady();

  window.customElements.define(BPASS_BUTTON_TAG, BpassButton);
  return new Promise((resolve, reject) => {
    const isInner = window.top !== window.self;

    const injetState = {
      isInner: window.top !== window.self,
    };

    logger.debug('>>>>>>Injet sub>>>>>>>>>>>>>', injetState);
    const controller = new FeildController(injetState);

    if (LOG_LEVEL === 'DEBUG') {
      logger.warn('open debug mode.', LOG_LEVEL);
      global.fctx = controller;
    }

    controller.checkLoginForm();
    return resolve({ controller, injetState });
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
