import ObservableStore from 'obs-store';
import { debounce } from 'lodash';

import logger from '@lib/logger';

import Zombie from '@lib/messages/corpse-chaser';
import BaseController from './base-controller';
import { ENV_TYPE_INJET_TOP } from '@lib/enums';
import { BPASS_SELECTOR_TAG } from './bpass-selector';

/*********************************************************************
 * AircraftClass ::
 *    @description: Page Top Iframe controller,management the leech box
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-10-27
 *    @comments: 2020-11-25 firefox refactor
 *      bacause firefox content script can't get extension id,
 *      so all dependencies extid resources need fetch back used message
 *      at instance lifetime
 **********************************************************************/
class TopController extends BaseController {
  constructor({ initConfig }) {
    super({ type: 'BPTopCtx_' });

    this.initConfig = initConfig || {};

    /** login fields Valt */
    this.fieldValtState = new ObservableStore({
      activedField: '',
      username: '',
      password: '',
      hostname: '',
    });

    /** backend state */
    this.backendStore = new ObservableStore({
      isUnlocked: false,
      items: [],
      matchedNum: 0,
      exactMatched: false,
    });

    // logger.debug('>>>TopController>>>>>>>>>>>>>>>>>>', this.getId());

    /** ---------  ---------- */
    this.once('actived:zombie-communication', this.createAndStartupZombieCommunication.bind(this));
  }

  /* +++++++++++++++++++++++++ Events & Listeners begin +++++++++++++++++++++++++++++ */

  createAndStartupZombieCommunication(hostname) {
    this.zombie = new Zombie({
      portName: ENV_TYPE_INJET_TOP,
      updateMatchedState: this.updateBackendStoreHandler.bind(this),
    });

    this.zombie.startupZombie({ hostname });
  }

  /**
   * 更新backend data
   *
   */
  updateBackendStoreHandler(state) {
    this.backendStore.updateState({ ...state });
    logger.debug('updateBackendStoreHandler:>>>>>>>>>>>>>>>>>>>>>>>', state);
  }

  updateFieldValtStoreHandler(valtState) {
    this.fieldValtState.updateState(valtState);
    logger.debug('updateFieldValtStoreHandler:>>>>>>>>>>>>>>>>>>>>>>>', valtState);
  }

  /* ####################### Handle Top Message Starting ######################### */
  updatefindedMessageHandler(data) {
    const { hostname = '', isInner = false, href = '' } = data;
    this.loginHostname = hostname;
    this.loginHref = href;
    this.isInner = isInner;

    //startup communication
    this.emit('actived:zombie-communication', hostname);
  }

  drawingSelector(data) {
    logger.debug('TopController:drawingSelector>>>', data);
    const ifrSrc = this.getLeechSrc();
    _drawingSelectorBox.call(this, ifrSrc, data);

    //_drawingBpassSelectorZeroLayer.call(this, ifrSrc, { ...position, ifrHeight: iHeight, isInner});
  }

  /* ********************* Commons Methods Begin **************************** */
  getExtId() {
    const extid = this.initConfig.extid || '';
    if (!extid) {
      logger.warn('TopController unfound extid.');
    }

    return extid;
  }

  getLeechSrc() {
    const src = this.initConfig.leechSrc || '';
    if (!src) {
      logger.warn('TopController unset leechSrc property.');
    }
    return src;
  }
}

/** ----------------------------- Private Functions Begin --------------------------------- */

/**
 * TODO multi layers
 * can not get window posiChains
 * @param {string} src iframe src
 * @param {object} options [left,top,height,width,x,y,isInner,ifrHeight,atHref]
 */
function _drawingSelectorBox(src, options) {
  logger.debug('TopController::_drawingSelectorBox-->>>>', src, options);
  createSelectorBox(src, options);
}

function _drawingBpassSelectorZeroLayer(src, position) {
  logger.debug('TopController:_drawingBpassSelectorZeroLayer>>>', position);
  // createSelectorElement(src, position);
  createSelectorBox(src, position);
}

function createSelectorBox(src, position) {
  if (!position || !position.ifrHeight || !position.width) {
    logger.warn('Params miss>>>', position);
  }
  const { left = 0, top = 0, width = 0, height, ifrHeight, isInner, atHref = '' } = position;
  let box = document.querySelector('selector-box');
  logger.debug('createSelectorBox>>>', box, position);
  const exists = !!box;
  if (!exists) {
    box = document.createElement('selector-box');
  }
  box.setAttribute('uts', new Date().getTime());
  box.setAttribute('src', src);
  box.setAttribute('at-width', width);
  box.setAttribute('at-height', height);
  box.setAttribute('at-left', left);
  box.setAttribute('at-top', top);
  box.setAttribute('ifr-height', ifrHeight);
  if (isInner) {
    box.setAttribute('is-inner', isInner);
  } else {
    box.hasAttribute('is-inner') && box.removeAttribute('is-inner');
  }

  if (atHref) {
    box.setAttribute('at-href', atHref);
  }

  if (!exists) {
    document.body.insertAdjacentElement('beforeend', box);
  }
}

function createSelectorElement(src, { width = 0, height = 0, left = 0, top = 0, iHeight = 0 }) {
  let selector = document.querySelector(BPASS_SELECTOR_TAG);

  const exists = !!selector;
  if (!exists) {
    selector = document.createElement(BPASS_SELECTOR_TAG);
  }
  selector.setAttribute('i-width', width);
  selector.setAttribute('i-height', height);
  selector.setAttribute('ifr-height', iHeight);
  selector.setAttribute('i-left', left);
  selector.setAttribute('i-top', top);
  selector.setAttribute('src', src);

  if (!exists) {
    document.body.insertAdjacentElement('beforeend', selector);
  }
}

export default TopController;