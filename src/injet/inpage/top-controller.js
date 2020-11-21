import EventEmitter from 'events';
import { nanoid } from 'nanoid';
import { debounce } from 'lodash';
import ObservableStore from 'obs-store';
import ResizeObserver from 'resize-observer-polyfill';

import logger from '@/libs/logger';
import Zombie from '@/libs/messages/corpse-chaser';

import {
  SELECTOR_OPTIONS_TAG,
  IFR_MIN_WIDTH,
  IFR_MAX_WIDTH,
  IFR_DEFAULT_WIDTH,
} from './selector-options';

import { ENV_TYPE_INJET_TOP } from '@/libs/enums';
const AddMaxHeight = 275;

import { getLeechSrc } from './comm-utils';

/*********************************************************************
 * AircraftClass ::
 *     @Description: Page Top Iframe controller,management the leech box
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-10-27
 **********************************************************************/
class TopController extends EventEmitter {
  constructor(initState) {
    super();
    this._uuid = 'BPTOP-' + nanoid();
    this.extid = chrome.runtime.id;
    this.leechUrl = getLeechSrc(this.extid);
    this.loginIfr = null;
    this.hasLogin = false;
    this.loginHostname = '';

    this.lastPosition = null;
    this.lastIHeight = 0;

    this.valStore = new ObservableStore({
      username: '',
      password: '',
      items: [],
      isUnlocked: false,
    });
    this.addPage = '';

    this.feildValtStore = new ObservableStore({
      username: '',
      password: '',
    });

    this.backendStore = new ObservableStore({
      isUnlocked: false,
      items: [],
      matchedNum: 0,
      exactMatched: false,
    });

    this.cfgStore = new ObservableStore({ hasLogin: false });

    this.resizeObserver = new ResizeObserver(debounce(this.resizePositionListener.bind(this), 10));

    this.once('startup:resize:obs', this.startResizeObserver.bind(this));
    // this.once('startup:scroll:obs',this.startupScrollObserver.bind(this));

    this.on('update:selector:position', this.updateSelectorPositionListener.bind(this));

    /** Start zombie */
    this.once(
      'create:active:zombie-communication',
      this.createAndActiveZombieCommunication.bind(this)
    );
    // this.once('active:zombie:communication', this.activeZombie.bind(this));

    listeningBodyChanged.call(this);

    const ctx = this;
    window.addEventListener(
      'scroll',
      debounce((ev) => {
        ctx.emit('update:selector:position');
      }, 10)
    );
  }

  /**
   *
   */
  async createAndActiveZombieCommunication() {
    const { hostname } = await this.cfgStore.getState();

    this.zombie = new Zombie({
      portName: ENV_TYPE_INJET_TOP,
      updateMatchedState: this.updateValStoreFromBackend.bind(this),
    });

    this.zombie.startupZombie({ hostname });
  }

  /**
   *
   * @param {*} param0
   */
  findedLoginFeildsInitTopInfo(message) {
    //
    const { href, isInner, hostname } = message;
    this.loginHostname = hostname;

    logger.debug(
      '>>>>>>>>>>>>>findedLoginFeildsInitTopInfo>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
      message
    );

    if (isInner) {
      window.document.querySelectorAll('iframe').forEach((ifr) => {
        if (ifr.src === href) {
          this.loginIfr = ifr;
        }
      });
    }

    const cfgState = {
      isInner,
      hostname: hostname,
      hasLogin: true,
    };

    // set config
    this.cfgStore.updateState(cfgState);

    this.emit('create:active:zombie-communication');

    // this.emit('startup:scroll:obs',{})
  }

  /**
   * state from login message or background message
   * @param {object} state
   * @property {string} username
   * @property {string} password
   */
  updateValStoreFromLoginForm(state) {
    const type = 'feildVal';
    this.valStore.updateState({ ...state, type });
    this.feildValtStore.updateState({ ...state, type });

    this.backendOrFieldChangedCalcIfrSizeState('Recvied data field');
    //
    // this.updateSelectorHeight();
    // this.calcMatchedUpdateSelector();
  }

  /**
   * @param {object} state
   * @property {boolean} isUnlocked
   * @property {Array} items
   */
  updateValStoreFromBackend(state) {
    const type = 'rowsState';
    logger.debug('Zombie&&TopController:updateValStoreFromBackend >>>>>>', state);
    this.valStore.updateState({ ...state, type });
    this.backendStore.updateState({ ...state, type });
    this.backendOrFieldChangedCalcIfrSizeState('Recvied data backend');
  }

  /**
   * start resize once
   * only hasLoginform
   * @todo when login feilds in top
   */
  startResizeObserver(options) {
    // console.log('TopController:startResizeObserver>>>', this, options);
    const { innerHref } = options;
    this.resizeObserver && this.resizeObserver.observe(document.body);
  }

  /**
   *
   * @param {*} options
   */
  startupScrollObserver(options) {
    const { hasLogin, isInner } = this.cfgStore.getState();
    if (hasLogin) {
      // console.log("startupScrollObserver>>>>>>>>>>>>>>>>>>>>", `isInner:[${isInner}]`)
      if (isInner) {
      } else {
        window.addEventListener('scroll', (e) => {
          // console.log("startupScrollObserver>>>>>>>>>>>>>>>>>>>>", e)
        });
      }
    }
  }

  /**
   *
   */
  resizePositionListener(entries) {
    const { hasLogin } = this.cfgStore.getState();

    if (!hasLogin) return;
    if (!!this.loginIfr && !!this.lastPosition) {
      const calcPosition = calcLeechPosition(
        this.lastPosition,
        this.loginIfr.getBoundingClientRect()
      );
      //update position
      calcPosition &&
        document.querySelector(SELECTOR_OPTIONS_TAG) &&
        document.querySelector(SELECTOR_OPTIONS_TAG).updatePosition(calcPosition);
    }
  }

  /**
   *
   * @param {object} position feildPosition
   */
  updateSelectorPositionListener(feildPosition) {
    const selector = document.querySelector(SELECTOR_OPTIONS_TAG);
    if (selector) {
      selector.remove();
    }
    // console.log('ifrPosition>>>>>>>>>>>>>>', this, selector);
    // if (!selector) return;

    // let ifrPosition = (this.loginIfr && this.loginIfr.getBoundingClientRect()) || {};

    // let position = typeof feildPosition !== 'object' ? this.lastPosition : feildPosition;

    // if (!position) {
    //   logger.warn(`TopController:updateSelectorPositionListener>>> no activedPosition`, position);
    //   return;
    // }

    // // update last
    // this.lastPosition = position;

    // const calcPosition = calcLeechPosition(position, ifrPosition);
    // // console.log('ifrPosition-updateSelectorPositionListener>>>>>>>>', position, feildPosition, calcPosition);
    // !!calcPosition && selector.updatePosition(calcPosition);
  }

  /**
   *
   * @param {*} message
   */
  updateSelectorPosition(message) {
    if (!message || typeof message !== 'object') return;
    const selector = document.querySelector(SELECTOR_OPTIONS_TAG);
    const calcPosition = calcLeechPositionByMessage(message);
    if (!selector || !calcPosition) return;

    this.lastPosition = message.position;

    selector.updatePosition(calcPosition);
  }

  /**
   * 计算 是否弹出选择框
   * @param {} type
   */
  backendOrFieldChangedCalcIfrSizeState(type) {
    /**  */
    const valtState = this.feildValtStore.getState();
    const backState = this.backendStore.getState();

    logger.debug(
      'backendOrFieldChangedCalcIfrSizeState>>>>>>>>>>>>>>>>>>>>>>>',
      valtState,
      backState,
      type
    );

    // field changed
    const { isUnlocked = false, items = [], exactMatched = false } = backState;
    const { username = '', password = '' } = valtState;

    const selector = document.querySelector(SELECTOR_OPTIONS_TAG);
    let matchedNum = items.length;
    let _filterUNames = [],
      rows = items.length;
    let oper = ''; //update /erase draw

    if (selector) {
      oper = 'update';
    }

    if (!isUnlocked) {
      return {
        isHidden: !Boolean(selector), // 存在就显示,设置display = none
        isUnlocked,
        exactMatched,
        rows: 0,
        matchedNum,
      };
    }

    /**
     *
     */
    if (username && matchedNum > 0) {
      _filterUNames = items.filter((it) => it.username.startsWith(username));
      // _filterUNames.length<= show
      if (_filterUNames.length <= 0 && !username) {
        return {
          isHidden: true,
          isUnlocked,
          matchedNum,
          exactMatched,
          rows: _filterUNames.length,
        };
      }
    }
    if (matchedNum > 0 && (!username || !password)) {
      return {
        isHidden: false,
        isUnlocked,
        matchedNum,
        exactMatched,
        rows: matchedNum,
      };
    }
  }

  calcMatchedUpdateSelector() {
    const { unlocked = false, rows = 0, erase = false } = this.getIfrSizeState();
    logger.debug('updateSelectorHeight>>>>>>>>>>>>>>>>>>>>>>>', rows, unlocked, erase);
    const selector = document.querySelector(SELECTOR_OPTIONS_TAG);
    if (erase) {
      document.querySelector(SELECTOR_OPTIONS_TAG) &&
        document.querySelector(SELECTOR_OPTIONS_TAG).remove();
    } else {
      if (selector) {
        selector.setAttribute('unlocked', unlocked);
        selector.setAttribute('rows', rows);
      }
    }
  }

  setSelectorHeight(height) {
    const selector = document.querySelector(SELECTOR_OPTIONS_TAG);
    if (selector) {
      selector.setAttribute('i-height', height);
    }
  }

  setAddPageHeight(message) {
    logger.debug('TSelector:>>>>>>>>>>>>>>>>>>>>>>>', message);
    if (message.page) {
      this.addPage = message.page;
      const iHeight = message.iHeight;
      this.setSelectorHeight(iHeight);
    }
  }

  /**
   *
   */
  getIfrSizeState() {
    const { isUnlocked, items, username, matchedNum, password } = this.valStore.getState();

    let rows = matchedNum,
      erase = false;
    if (isUnlocked && username && password) {
      let item = items.find((it) => it.username === username);
      if (item) {
        rows = 1;
      } else {
        let _items = items.filter((it) => it.username.startsWith(username));
        rows = _items.length > 0 ? _items.length : 0; // like == 0 return all
      }
    } else if (username && !password) {
      erase = true;
    }

    return {
      unlocked: isUnlocked,
      rows,
      erase,
    };
  }

  drawSelector(message) {
    if (!message || typeof message !== 'object') return;

    const { innerHref, position, valtState, iHeight } = message;
    this.lastIHeight = iHeight;
    this.addPage = '';
    if (typeof valtState === 'object') {
      this.updateValStoreFromLoginForm(valtState);
    }
    const calcPosition = calcLeechPositionByMessage(message);
    logger.debug(`TopController>>drawSelector>>>`, calcPosition);
    logger.debug(`FeildController:focusin received>>>`, message);
    if (calcPosition) {
      this.lastPosition = position;
      this.emit('startup:resize:obs', { innerHref });
      drawSelectorOptionsWithHeight.call(this, calcPosition, this.leechUrl, iHeight);
    }
  }

  /**
   *
   * @param {object} data [innerHref, position, valtState,isInner]
   */
  drawSelectorOrUpdate(data) {
    if (!data) return;
    const { innerHref, position, valtState, isInner, iHeight } = data;
    this.lastIHeight = iHeight;

    if (typeof valtState === 'object') {
      this.updateValStoreFromLoginForm(valtState);
    }

    let selector = document.querySelector(SELECTOR_OPTIONS_TAG);

    const calcPosition = calcLeechPositionByMessage({ isInner, innerHref, position });
    if (!selector) {
      this.addPage = '';
      if (calcPosition) {
        this.lastPosition = position;
        this.emit('startup:resize:obs', { innerHref });
        drawSelectorOptionsWithHeight.call(this, calcPosition, this.leechUrl, iHeight);
      }
    } else {
      selector.setAttribute('i-height', iHeight);
    }
  }

  toggleSelector(message) {
    if (!message || typeof message !== 'object') return;
    const { innerHref, activedValue, position, isInner, iHeight } = message;
    this.addPage = '';
    const calcPosition = calcLeechPositionByMessage(message);
    const elem = document.querySelector(SELECTOR_OPTIONS_TAG);
    // logger.debug(`TopController>>toggleSelector: ${isInner}>>>`, position, innerHref, calcPosition, elem);

    if (calcPosition === null) {
      //TODO throw error
      throw 'recive error position.';
    } else {
      !elem
        ? drawSelectorOptionsWithHeight.call(this, calcPosition, this.leechUrl, iHeight)
        : this.eraserSelector(true);
    }
  }

  eraserSelector(force = false) {
    if (Boolean(force) || !this.addPage) {
      document.querySelector(SELECTOR_OPTIONS_TAG) &&
        document.querySelector(SELECTOR_OPTIONS_TAG).remove();
    }
  }
}

/**
 *
 * @param {object} message
 * @property {boolean} isInner
 * @property {object} position
 * @property {url} innerHref
 *
 */
function calcLeechPositionByMessage(message) {
  const fixT = 1;
  if (!message || typeof message.position !== 'object' || !message.position.width) return null;

  const { isInner, position, innerHref } = message;
  let ifrPosition = {};
  if (isInner && innerHref) {
    document.querySelectorAll('iframe').forEach((ifr) => {
      if (ifr.src === innerHref) {
        ifrPosition = ifr.getBoundingClientRect();
      }
    });
  }

  let ol = 0,
    ot = 0,
    width = calcIfrWidth(position.width),
    fl = position.left || 0,
    ft = position.top || 0,
    fh = position.height;

  if (typeof ifrPosition === 'object') {
    ol = ifrPosition.left || 0;
    ot = ifrPosition.top || 0;
  }

  // console.log("(position.width - width)>>>>>>>>>>>>>*********", (position.width - width))

  return {
    left: ol + fl,
    top: ot + ft + fh + fixT,
    width,
  };
}

/**
 *
 * @param {object} position domRect
 * @param {object} ifrPosition domRect
 */
function calcLeechPosition(position, ifrPosition = {}) {
  if (!position || !position.width || !position.height) return false;

  const fixT = 1;

  let ol = 0,
    ot = 0,
    width = calcIfrWidth(position.width),
    fl = position.left || 0,
    ft = position.top || 0,
    fh = position.height;

  if (typeof ifrPosition === 'object') {
    ol = ifrPosition.left || 0;
    ot = ifrPosition.top || 0;
  }

  //(position.width - width)

  // console.log("(position.width - width)>>>>>>>>>>>>>*********", (position.width - width))

  return {
    left: ol + fl,
    top: ot + ft + fh + fixT,
    width,
  };
}

function calcIfrWidth(feildWidth) {
  if (!feildWidth) return IFR_DEFAULT_WIDTH;
  return parseFloat(feildWidth) >= IFR_MAX_WIDTH || parseFloat(feildWidth) < IFR_MIN_WIDTH
    ? IFR_DEFAULT_WIDTH
    : feildWidth;
}

/**
 * @todo
 */
function listeningBodyChanged() {
  const ctx = this;

  /**
   * childList
   * subtree
   * attributes
   * attributeFilter:[],
   * characterData
   */
  const config = { attributes: true, subtree: true, childList: true };
  const watchTarget = document.body;

  // const observer = new MutationObserver(debounce(mutationCallback,200))

  // observer.observe(watchTarget, config)

  // function mutationCallback(mutations) {
  //   mutations.forEach(mutations => {
  //     console.log('Top>>>>>>>>>>>>>>>>>', mutations)
  //   })
  // }
}

function drawSelectorOptionsWithHeight(position, url, iHeight) {
  let seletorRoot = document.querySelector(SELECTOR_OPTIONS_TAG);
  if (!seletorRoot) {
    seletorRoot = document.createElement(SELECTOR_OPTIONS_TAG);
    seletorRoot.setAttribute('src', url);
    seletorRoot.updatePosition(position);
    document.body.appendChild(seletorRoot);
  } else {
    seletorRoot.setAttribute('src', url);
    seletorRoot.updatePosition(position);
  }
  // seletorRoot.setAttribute('unlocked', unlocked);
  seletorRoot.setAttribute('i-height', iHeight);

  return seletorRoot;
}

function drawSelectorOptions(position, url) {
  const sizeState = this.getIfrSizeState();
  const { unlocked = false, rows = 0 } = sizeState;

  let seletorRoot = document.querySelector(SELECTOR_OPTIONS_TAG);
  if (!seletorRoot) {
    seletorRoot = document.createElement(SELECTOR_OPTIONS_TAG);
    seletorRoot.setAttribute('src', url);
    seletorRoot.updatePosition(position);
    document.body.appendChild(seletorRoot);
  } else {
    seletorRoot.setAttribute('src', url);
    seletorRoot.updatePosition(position);
  }
  seletorRoot.setAttribute('unlocked', unlocked);
  seletorRoot.setAttribute('rows', rows);

  return seletorRoot;
}

export default TopController;
