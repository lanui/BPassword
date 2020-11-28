import { debounce } from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import ObservableStore from 'obs-store';

import logger from '@/libs/logger';
import BaseController from './base-controller';

import { BPASS_BUTTON_TAG } from './bpass-button';

import {
  API_WIN_FINDED_LOGIN,
  API_WIN_SELECTOR_DRAWER,
  API_WIN_SELECTOR_ERASER,
  API_WIN_SELECTOR_ERASER_FORCE,
  API_WIN_SELECTOR_UP_POSITION,
  API_WIN_SELECTOR_UP_VALT,
  API_WIN_SELECTOR_UP_DRAWER,
  API_RT_FIELDS_VALT_CHANGED,
  API_WIN_SELECTOR_TOGGLE,
} from '@/libs/msgapi/api-types';

import { ENV_TYPE_INJET } from '@/libs/enums';
import Zombie from '@/libs/messages/corpse-chaser';

import { ifrSizeCalcWhenValtChanged } from '@/libs/controllers/size-calculator';

export const PASSWORD_SELECTOR = 'input[type="password"][name],input[type="password"]';
export const USERNAME_SELECTOR =
  'input[type="mail"][name],input[type="text"][name],input[type="text"][id],input[type="text"]';

/**
 * 1.check login feilds
 *
 */
class FeildController extends BaseController {
  constructor({ isInner, topId }) {
    super({ type: 'bplogin_' });
    this.isInner = Boolean(isInner);
    this.hostname = new URL(window.location.href).hostname;
    this.topId = topId;
    this.extid = chrome.runtime.id;

    this.activedTarget = null;

    /**
     *
     */
    this.store = new ObservableStore({ matchedNum: 0, isUnlocked: false });

    this.resizeObserver = new ResizeObserver(debounce(this.resizePositionListener.bind(this), 15));

    //unused
    this.on('checked:loginform', this.checkLoginForm.bind(this));

    this.once('create:actived:zombie', createAndActiveZombie.bind(this));

    this.mutationObserver = new MutationObserver(debounce(this.mutationObsHandler.bind(this), 50));

    if (document.body.childElementCount > 0) {
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    this.once('startup:scroll:obs', this.startupScrollObserver.bind(this));
    //startup listening element changed
    listenSelfFrameChanged.call(this);

    this.once('startup:fields:rtlistener', this.startupFieldRtListener.bind(this));

    this.on('bind:input:valtChanged', this.bindingInputValtChanged.bind(this));
    this.on('unbind:input:valtChanged', this.unbindInputValtChanged.bind(this));
  }

  comboParams(activeField) {
    const { isUnlocked = false, items = [] } = this.store.getState();
    const paramState = {
      activeField,
      isUnlocked,
      items,
      hostname: this.hostname,
      username: this.targetUsername ? this.targetUsername.value : '',
      password: this.targetPassword ? this.targetPassword.value : '',
    };
    return paramState;
  }

  bindingInputValtChanged(el) {
    el.addEventListener('input', debounce(this.inputFieldValtChangedHandle.bind(this), 800), true);
  }

  unbindInputValtChanged(el) {
    el.removeEventListener('input', this.inputFieldValtChangedHandle.bind(this), true);
  }

  zombieSendValtToBack(valtState) {
    if (this.zombie && this.zombie.remote) {
      logger.debug('zombieSendValtToBack>>>>>>>', valtState);
      this.zombie.postMessage(API_RT_FIELDS_VALT_CHANGED, valtState);
    }
  }

  /**
   * 1. send to back
   * 2. send to top
   */
  inputFieldValtChangedHandle(e) {
    const isInner = this.isInner;
    let activeField = '';
    if (e.target === this.targetPassword) {
      activeField = 'password';
    } else if (e.target === this.targetUsername) {
      activeField = 'username';
    }

    const valtState = {
      hostname: this.hostname,
      activeField,
      username: this.targetUsername.value,
      password: this.targetPassword.value,
    };
    logger.debug('inputFieldValtChangedHandle>>>>', e.target.value, valtState);

    //send to background
    this.zombieSendValtToBack(valtState);

    window.top.postMessage(
      {
        apiType: API_WIN_SELECTOR_UP_VALT,
        data: valtState,
      },
      '*'
    );

    // 判断如何弹框和弹框高度
    const pramsState = this.comboParams(activeField);
    const ifrSizeState = ifrSizeCalcWhenValtChanged(pramsState);

    const { elemType, iHeight, tag } = ifrSizeState;
    logger.debug('TSelector:FeildController:inputchanged>>>>', elemType, iHeight, tag);

    let domRect = e.target.getBoundingClientRect();
    const message = {
      apiType: API_WIN_SELECTOR_UP_DRAWER,
      data: {
        isInner,
        innerHref: window.location.href,
        position: domRect,
        valtState,
        iHeight,
      },
    };

    if (this.targetPassword && this.targetPassword.type === 'password') {
      if (elemType === 'drawing') {
        message.apiType = API_WIN_SELECTOR_UP_DRAWER;
        window.top.postMessage(message, '*');
      } else {
        message.apiType = API_WIN_SELECTOR_ERASER;
        window.top.postMessage(message, '*');
      }
    }
  }

  /**
   * received remote message
   */
  startupFieldRtListener() {
    logger.debug('start.... rtMessageListenHandler>>>>>>>>>>>>>>>');
    chrome.runtime.onMessage.addListener(this.rtMessageListenHandler.bind(this));
  }

  async rtMessageListenHandler(reqData, sender, sendResp) {
    const isFn = typeof sendResp === 'function';
    logger.debug('rtMessageListenHandler>>>>>>>>>>>>>>>', reqData, sender, window.location.origin);
    let hostname = '';
    if (window.location.origin) {
      try {
        hostname = new URL(window.location.origin).hostname;
      } catch (ex) {}
    }

    const data = {
      username: this.targetUsername ? this.targetUsername.value : '',
      password: this.targetPassword ? this.targetPassword.value : '',
      hostname,
    };

    if (isFn) {
      sendResp(data);
      return true;
    }
  }

  startupScrollObserver(listenerHandler) {
    window.document.addEventListener('scroll', debounce(listenerHandler, 50));
  }

  scrollListener(e) {
    //scroll remove
    document.querySelector(BPASS_BUTTON_TAG) && document.querySelector(BPASS_BUTTON_TAG).remove();
    forceEraserSelectorMessage();
  }

  /**
   *
   * @param {object} respData
   */
  updateMatchedState(respData = {}) {
    logger.debug('Injet:&&zombie:updateMatchedState>>', respData);
    this.store.updateState({ ...respData });
  }

  setActivedTarget(target) {
    this.activedTarget = target || null;
  }

  /**
   * watch loginFeilds dom body resize
   * @author lanbery@gmail.com
   * @param {object} entries
   */
  resizePositionListener(entries) {
    // logger.debug('FeildController:resizePositionListener>>>>', entries ,this.activedTarget)
    if (this.activedTarget) {
      updateBpassButtonPosition.call(this, this.activedTarget);

      const isInner = window.top !== window.self;
      const innerHref = window.location.href;
      const activedValue = this.activedTarget.value;

      let domRect = this.activedTarget.getBoundingClientRect();

      window.top.postMessage(
        {
          apiType: API_WIN_SELECTOR_UP_POSITION,
          isInner,
          innerHref,
          activedValue,
          position: domRect,
        },
        '*'
      );
    }
  }

  /**
   * checkForm again
   * @param {*} records
   * @param {*} iself
   */
  mutationObsHandler(records) {
    if (!this.targetPassword || !this.targetUsername) {
      const { targetPassword, targetUsername } = findLoginFeildsInDom();
      this.targetPassword = targetPassword;
      this.targetUsername = targetUsername;
      logger.debug('FeildController:mutationObsHandler>>>>>', targetPassword, targetUsername);

      if (targetPassword && targetUsername) {
        const href = window.location.href;
        const extid = this.extid;
        this.emit('create:actived:zombie', { href, extid });
        this.emit('startup:fields:rtlistener');
        this.emit('startup:scroll:obs', this.scrollListener.bind(this));

        BindingFocusEvents.call(this);
        const message = {
          apiType: API_WIN_FINDED_LOGIN,
          isInner: Boolean(this.isInner),
          senderId: this.getId(),
          href: window.location.href,
          hostname: new URL(window.location.href).hostname,
        };

        window.top.postMessage(message, '*');
      }
    }
  }

  hasFindedLoginFeilds() {
    return this.targetPassword && this.targetUsername;
  }

  checkLoginForm() {
    const { targetPassword, targetUsername } = findLoginFeildsInDom();
    this.targetPassword = targetPassword;
    this.targetUsername = targetUsername;

    this.hasLoginFeilds = targetPassword && targetUsername;
    if (this.hasLoginFeilds) {
      // logger.debug('checkLoginForm>>>>>>>>>>>>>>>', this);

      const href = window.location.href;
      const extid = this.extid;
      this.emit('create:actived:zombie', { href });
      this.emit('startup:fields:rtlistener');
      this.emit('startup:scroll:obs', this.scrollListener.bind(this));

      BindingFocusEvents.call(this);
      logger.debug(
        `checkLoginForm:finded is Login page ${this.targetPassword.name} :${this._href}`,
        this.isInner
      );

      const message = {
        apiType: API_WIN_FINDED_LOGIN,
        isInner: Boolean(this.isInner),
        senderId: this.getId(),
        href,
        hostname: new URL(window.location.href).hostname,
      };

      window.top.postMessage(message, '*');
    }
  }

  /**
   *
   * @param {object} item
   */
  filledInputFeilds(item) {
    if (!item || typeof item !== 'object') {
      logger.warn('receive item data illegal.', item);
      return;
    }
    logger.debug('zombie&& received data', item);

    if (item.password && this.targetPassword) {
      this.targetPassword.value = item.password;
    }

    if (item.username && this.targetUsername) {
      this.targetUsername.value = item.username;
    }

    const isInner = this.isInner;
    eraserSelectorMessage.call(this, isInner);
  }

  bpassButtonClickHandle(target) {
    let activeField = '';
    if (target === this.targetPassword) {
      activeField = 'password';
    } else if (target === this.targetUsername) {
      activeField = 'username';
    }
    logger.debug('bpassButtonClickHandle>>>>>>>', this, target, activeField);

    // 判断如何弹框和弹框高度
    const pramsState = this.comboParams(activeField);
    const ifrSizeState = ifrSizeCalcWhenValtChanged(pramsState);

    const { elemType, iHeight, tag, isUnlocked } = ifrSizeState;
    logger.debug('TSelector:bpassButtonClickHandle>>>>', elemType, iHeight, tag);
    const valtState = {
      activeField,
      username: this.targetUsername ? this.targetUsername.value : '',
      password: this.targetPassword ? this.targetPassword.value : '',
    };

    logger.debug(`bindingActivedFocusEvents>>>>>`, valtState);

    const isInner = window.top !== window.self;
    const innerHref = window.location.href;

    const domRect = target.getBoundingClientRect();
    if (isUnlocked) {
      if (activeField === 'password') {
        const message = {
          apiType: API_WIN_SELECTOR_TOGGLE,
          isInner,
          innerHref,
          position: domRect,
          valtState,
          iHeight,
        };
        window.top.postMessage(message, '*');
      } else if (activeField === 'username') {
        const message = {
          apiType: API_WIN_SELECTOR_ERASER_FORCE,
          iHeight,
        };
        window.top.postMessage(message, '*');
      }
    } else {
      const message = {
        apiType: API_WIN_SELECTOR_TOGGLE,
        isInner,
        innerHref,
        position: domRect,
        valtState,
        iHeight,
      };
      window.top.postMessage(message, '*');
    }
  }
}

function listenSelfFrameChanged() {
  const ctx = this;
  const url = window.location.href;
  if (ctx.isInner) {
    const config = { attributes: true, subtree: true, childList: true };
    // let elObersver = new MutationObserver((mutations) => {
    //   logger.debug(`MutationObserver : ${url} >>>>>>`, mutations);
    // });
  }
}

function findLoginFeildsInDom() {
  const ret = {
    targetPassword: null,
    targetUsername: null,
  };

  let _password = window.document.querySelector(PASSWORD_SELECTOR);

  if (!_password) {
    return ret;
  } else {
    //SB 163.com has two password input
    if (_password.style.display === 'none') {
      // logger.debug('163.com >>>>', _password.style.display);
      window.document.querySelectorAll(PASSWORD_SELECTOR).forEach((el) => {
        if (el.style.display !== 'none') {
          _password = el;
        }
      });
    }
  }

  let _username = null;

  if (_password.form) {
    logger.debug('FeildController:mutationObsHandler:findLoginFeildsInDom>>>>>', _password);
    //163
    _username =
      _password.form.querySelector(USERNAME_SELECTOR) &&
      _password.form.querySelector(USERNAME_SELECTOR).style.display !== 'none'
        ? _password.form.querySelector(USERNAME_SELECTOR)
        : null;
    // pan.baidu.com or yun.baidu.com dynamic create password
    _username =
      _username &&
      _username.getBoundingClientRect() &&
      _username.getBoundingClientRect().width === 0
        ? null
        : _username;
  }

  //
  if (_password && !_username) {
    _username = recursiveQuery(_password, USERNAME_SELECTOR);
    //document.body.querySelector(USERNAME_SELECTOR);
  } else {
    logger.debug(
      'FeildController:mutationObsHandler:recursiveQuery>>>>>>>>>>>>>>>>>',
      _username.getBoundingClientRect()
    );
  }

  //
  // if (!!_username && _username.style.display === 'none'){
  //   _username = recursiveQuery(_password, USERNAME_SELECTOR)
  // }

  let position = {};
  if (_password) {
    position = _password.getBoundingClientRect();
  }

  if (!_password || !_username) {
    return ret;
  }

  return {
    targetPassword: _password,
    targetUsername: _username,
  };
}

function BindingFocusEvents() {
  const ctx = this;

  if (ctx.targetPassword) {
    bindingActivedFocusEvents(ctx.targetPassword);
  }
  if (ctx.targetUsername) {
    bindingActivedFocusEvents(ctx.targetUsername);
  }

  function bindingActivedFocusEvents(elem) {
    if (!elem) return;

    elem.addEventListener('focusin', (e) => {
      ctx.setActivedTarget(e.target);
      const _hostname = new URL(window.location.href).hostname;
      let activeField = '';
      if (e.target === ctx.targetPassword) {
        activeField = 'password';
      } else if (e.target === ctx.targetUsername) {
        activeField = 'username';
      }

      const activeValtState = {
        hostname: _hostname,
        activeField: activeField,
        username: ctx.targetUsername ? ctx.targetUsername.value : '',
        password: ctx.targetPassword ? ctx.targetPassword.value : '',
      };

      //send back
      logger.debug('zombieSendValtToBack:@focusin>>>', ctx);
      ctx.zombieSendValtToBack(activeValtState);

      const valtState = {
        activeField,
        username: ctx.targetUsername ? ctx.targetUsername.value : '',
        password: ctx.targetPassword ? ctx.targetPassword.value : '',
      };

      const { matchedNum, items } = ctx.store.getState();
      logger.debug(`bindingActivedFocusEvents>>>>>`, valtState, items);

      const isInner = window.top !== window.self;
      const innerHref = window.location.href;
      const activedValue = e.target.value;

      let domRect = e.target.getBoundingClientRect();
      let { height, width } = domRect;

      // const sendDrawerSelector = ctx.isFocusinSendDrawSelector.call(ctx);

      ctx.emit('bind:input:valtChanged', e.target);

      if (height > 0 && width > 0 && ctx.targetPassword && ctx.targetPassword.type === 'password') {
        e.target.setAttribute('autocomplete', 'off');

        drawBpassButtonRoot.call(ctx, e.target, isInner, activeField);

        // 判断如何弹框和弹框高度
        const pramsState = ctx.comboParams(activeField);
        const ifrSizeState = ifrSizeCalcWhenValtChanged(pramsState);

        const { elemType, iHeight, tag } = ifrSizeState;
        logger.debug('TSelector:FeildController:focusin>>>>', elemType, iHeight, tag);

        if (elemType === 'drawing') {
          const message = {
            apiType: API_WIN_SELECTOR_DRAWER,
            isInner,
            innerHref,
            position: domRect,
            activedValue,
            valtState,
            iHeight,
          };
          window.top.postMessage(message, '*');
        } else {
        }

        //resizes
        ctx.resizeObserver.observe(document.body);
      }
    });
    elem.addEventListener('focusout', (e) => {
      ctx.setActivedTarget(null);
      ctx.emit('unbind:input:valtChanged', e.target);

      let bpass = document.querySelector(BPASS_BUTTON_TAG);
      bpass && bpass.remove();

      //TODO remove selector
    });
  }
}

/**
 *
 * @param {*} target
 * @param {*} isInner
 */
function drawBpassButtonRoot(target, isInner, activeField) {
  if (!target) return;

  //TODO send input value to backend and top

  const domRect = target.getBoundingClientRect();
  let passRoot = document.querySelector(BPASS_BUTTON_TAG);
  if (!passRoot) {
    passRoot = document.createElement(BPASS_BUTTON_TAG);
    passRoot.setAttribute('is-inner', isInner);
    passRoot.setActivedTarget(target);
    passRoot.setActivedPosition(domRect);
    document.body.appendChild(passRoot);
  } else {
    passRoot.setAttribute('is-inner', isInner);
    passRoot.setActivedTarget(target);
    passRoot.setActivedPosition(domRect);
  }

  passRoot.setAttribute('active-field', activeField || '');
  const _ctx = this;
  passRoot.onClick = _ctx.bpassButtonClickHandle.bind(_ctx, target);
}

function updateBpassButtonPosition(target) {
  const passRoot = document.querySelector(BPASS_BUTTON_TAG);
  if (target && passRoot) {
    passRoot.setActivedPosition(target.getBoundingClientRect());
  }
}

/**
 *
 * @param {*} target
 * @param {*} selector
 */
function recursiveQuery(target, selector) {
  if (!target) return null;
  const parentElem = target.parentElement || null;
  if (!parentElem || (!!parentElem.tagName && parentElem.tagName.toLowerCase() === 'body')) {
    return null;
  }

  let findElem = null;

  //fixed baidu&sina&163 has two feild and first display:none
  parentElem.querySelectorAll(selector).forEach((el) => {
    logger.debug('recursiveQuery>>>>>>>>>>>>>>>>>', el.getBoundingClientRect());
    // fixed sina has multi input
    // find parent>first> display
    if (findElem === null && el.style.display !== 'none') {
      findElem = el;
      logger.debug('find TargetUsername&&&&>>>>>>>>>>>>>>>>>', findElem);
    }

    // baidu dync
    if (
      findElem &&
      findElem.getBoundingClientRect() &&
      findElem.getBoundingClientRect().width === 0
    ) {
      if (el.getBoundingClientRect() && el.getBoundingClientRect().width > 0) {
        findElem = el;
      }
    }
  });

  if (!findElem || findElem.style.display === 'none') {
    return recursiveQuery(parentElem, selector);
  } else {
    return findElem;
  }
}

/**
 *
 * @param {*} param0
 */
function createAndActiveZombie({ href }) {
  const extid = window.bp_ext_id;
  let hostname = new URL(href).hostname;

  const options = {
    hostname,
    isInner: this.isInner,
    portName: ENV_TYPE_INJET,
    includeTlsChannelId: true,
    updateMatchedState: this.updateMatchedState.bind(this),
    filledInputFeilds: this.filledInputFeilds.bind(this),
  };

  this.zombie = new Zombie(options);
  logger.debug(
    'createAndActiveZombie>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
    href,
    extid
  );
  this.zombie.startupZombie({ hostname, extid });
}

function eraserSelectorMessage(isInner) {
  let message = {
    apiType: API_WIN_SELECTOR_ERASER,
    isInner,
  };

  window.top.postMessage(message, '*');
}

function forceEraserSelectorMessage() {
  const message = {
    apiType: API_WIN_SELECTOR_ERASER_FORCE,
  };
  window.top.postMessage(message, '*');
}

export default FeildController;
