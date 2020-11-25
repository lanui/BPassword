import { debounce } from 'lodash';

import logger from '@lib/logger';
import BaseController from './base-controller';

import {
  API_WIN_FINDED_LOGIN,
  API_WIN_SELECTOR_DRAWER,
  API_WIN_SELECTOR_ERASER,
  API_WIN_SELECTOR_ERASER_FORCE,
  API_WIN_SELECTOR_UP_POSITION,
  API_WIN_SELECTOR_UP_VALT,
  API_WIN_SELECTOR_UP_DRAWER,
  API_PORT_FIELDS_VALT_CHANGED,
} from '@lib/msgapi/api-types';
import { ENV_TYPE_INJET } from '@lib/enums';

import { BPASS_BUTTON_TAG } from './bpass-button';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-25
 *    @comments:
 **********************************************************************/

export const PASSWORD_SELECTOR = 'input[type="password"][name],input[type="password"]';
export const USERNAME_SELECTOR =
  'input[type="mail"][name],input[type="text"][name],input[type="text"][id],input[type="text"]';

class FieldController extends BaseController {
  constructor() {
    super({ type: '__bpfield_' });

    /** ------- event -------- */
    this.on('lookup:login:fields', this.checkLoginForm.bind(this));
    this.on('enabled:input:valtChanged', this.enabledInputFieldValtChangedListener.bind(this));
    this.on('disabled:input:valtChanged', this.disabledInputFieldValtChangedListener.bind(this));
  }

  /** =========================== Event Methods Start ============================== */

  enabledInputFieldValtChangedListener(el) {
    logger.debug('FieldController:enabledInputFieldValtChangedListener#on>>>>>>', el);
    el &&
      el.addEventListener(
        'input',
        debounce(this.inputFieldValtChangedHandler.bind(this, el), 800),
        true
      );
  }

  disabledInputFieldValtChangedListener(el) {
    el && el.removeEventListener('input', this.inputFieldValtChangedHandler.bind(this), true);
  }

  inputFieldValtChangedHandler(target) {
    logger.debug('inputFieldValtChangedHandler>>>', target, target.value);
  }

  /** =========================== Methods Start ============================== */
  /**
   * lookup password & username field element
   */
  checkLoginForm() {
    const { targetPassword, targetUsername } = lookupLoginFeildsInDom();
    this.targetPassword = targetPassword;
    this.targetUsername = targetUsername;

    const hasFinded = targetPassword && targetUsername;

    if (hasFinded) {
      /**
       *
       * 0.bind focus events
       * 1.emit active Long connect background
       * 2.send message parent
       * 3.send message top -> create Long connect background
       * 4.emit valtChanged Listener
       * 5.emit scroll:obs
       *
       */
      BindingFocusEvents.call(this);

      // TODO emit active Long connect background
    }
  }

  setActivedTarget(target) {
    this.activedTarget = target || null;
  }

  iconClickHandler(activedTarget) {
    logger.debug('iconClickHandler>>>>>>>>>>>>>>>>', this, activedTarget);
  }

  getValtState(activedTarget) {
    const valtState = {
      activeField: activedTarget && activedTarget === this.targetPassword ? 'password' : 'username',
      hostname: this.getHost(),
      username: this.targetUsername ? this.targetUsername.value : '',
      password: this.targetPassword ? this.targetPassword.value : '',
    };

    return valtState;
  }
}

export default FieldController;

/** ++++++++++++++++++++++++++ Functions Start ++++++++++++++++++++++++++++++ */
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

    /**
     * Focusin
     */
    elem.addEventListener('focusin', (e) => {
      ctx.setActivedTarget(e.target);

      const activedValtState = ctx.getValtState(e.target);

      //TODO send valtState to background

      // enabled:input:valtChanged event
      ctx.emit('enabled:input:valtChanged', e.target);

      //TODO send message to top & jet message listener

      drawBPassButtonRoot.call(ctx, e);

      if (e.target === ctx.targetPassword) {
        e.target.setAttribute('autocomplete', 'off');
      } else if (e.target === ctx.targetUsername) {
      }
    });

    elem.addEventListener('focusout', (e) => {
      ctx.setActivedTarget(null);

      //TODO disabled:input:valtChanged
      ctx.emit('disabled:input:valtChanged', e.target);

      document.querySelector(BPASS_BUTTON_TAG) && document.querySelector(BPASS_BUTTON_TAG).remove();

      //TODO send selector
    });
  }
}

function drawBPassButtonRoot(e) {
  const domRect = e.target.getBoundingClientRect();

  let passRoot = document.querySelector(BPASS_BUTTON_TAG);
  if (passRoot) {
    passRoot.remove();
  }
  passRoot = document.createElement(BPASS_BUTTON_TAG);
  document.body.appendChild(passRoot);
  setDomRect(passRoot, domRect);
  const _ctx = this;
  passRoot.onClick = _ctx.iconClickHandler.bind(_ctx, e.target);

  return passRoot;
}

function setDomRect(elem, domRect) {
  const { left = 0, top = 0, width = 0, height = 0 } = domRect;
  elem.setAttribute('target-width', width);
  elem.setAttribute('target-height', height);
  elem.setAttribute('target-left', left);
  elem.setAttribute('target-top', top);
}

function lookupLoginFeildsInDom() {
  const ret = {
    targetPassword: null,
    targetUsername: null,
  };

  let _password = window.document.querySelector(PASSWORD_SELECTOR);

  if (!_password) {
    return ret;
  } else {
    //Fixed 163.com has two password input fields
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
    //Fixed 163.com has two password
    _username =
      _password.form.querySelector(USERNAME_SELECTOR) &&
      _password.form.querySelector(USERNAME_SELECTOR).style.display !== 'none'
        ? _password.form.querySelector(USERNAME_SELECTOR)
        : null;

    //fixed pan|yun.baidu.com
    _username =
      _username &&
      _username.getBoundingClientRect() &&
      _username.getBoundingClientRect().width === 0
        ? null
        : _username;
  }

  if (_password && !_username) {
    _username = recursiveQuery(_password, USERNAME_SELECTOR);
    //document.body.querySelector(USERNAME_SELECTOR);
  } else {
    logger.debug(
      'FeildController:mutationObsHandler:recursiveQuery>>>>>>>>>>>>>>>>>',
      _username.getBoundingClientRect()
    );
  }

  if (!_password || !_username) {
    return ret;
  }

  return {
    targetPassword: _password,
    targetUsername: _username,
  };
}

/**
 * lookup target field logic
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
    // fixed sina has multi input
    // find parent>first> display
    if (findElem === null && el.style.display !== 'none') {
      findElem = el;
      // logger.debug('find TargetUsername&&&&>>>>>>>>>>>>>>>>>', findElem);
    }

    //fixed Baidu dynamic
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
