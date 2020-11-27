import ObservableStore from 'obs-store';
import { debounce } from 'lodash';

import logger from '@lib/logger';

import Zombie from '@lib/messages/corpse-chaser';
import BaseController from './base-controller';
import { ENV_TYPE_INJET_TOP } from '@lib/enums';

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

    /** Bind Box Method begin */
    this.createSelectorBox = _createSelectorBox.bind(this);
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
    this.createSelectorBox(ifrSrc, data);
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
 *
 * @param {string} src
 * @param {Object} position
 */
function _createSelectorBox(src, position) {
  if (!position || !position.ifrHeight || !position.width) {
    logger.warn('Params miss>>>', position);
  }
  const { left = 0, top = 0, width = 0, height, ifrHeight, isInner, atHref = '' } = position;
  let box = document.querySelector('selector-box');
  logger.debug('ToopController::_createSelectorBox->>>', box, position);
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

export default TopController;
