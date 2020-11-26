import { nanoid } from 'nanoid';

import logger from '@lib/logger';

/*********************************************************************
 * AircraftClass ::
 *    @description: Bpass Pass items selector popup on webpage
 *    @description:
 * WARNINGS:
 *    If this file inject by manifest key 'content_script',
 *    enviroment can used runtime message api,id & getURL.
 *    If this file inject into webpage can not used runtime API.
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-26
 *    @comments: Refactor for Firefox,bacause the Javascript Object can't
 *      keep in the DomElement. so used string instead.
 **********************************************************************/

export class BpassSelector extends HTMLElement {
  constructor() {
    super();

    let shadow = this.shadowRoot;
    if (!shadow) {
      shadow = this.attachShadow({ mode: 'open' });
    }

    shadow.addEventListener('mousedown', (e) => {
      logger.log('BpassSelector:shadow@mousedown >>>', e, this);
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    _drawerInnerElements.call(this);

    this.updateStyles = _updateIframeStyles.bind(this);
    this.updateIframeSrc = _updateIframeSrc.bind(this);
  }

  connectedCallback() {
    this.updateIframeSrc();
    this.updateStyles();
  }

  disconnectedCallback() {
    //在元素从文档移除到时候，浏览器会调用这个方法
  }

  static get observedAttributes() {
    /* 属性数组，这些属性的变化会被被监视 */
    return ['src', 'i-width', 'i-height', 'i-left', 'i-top', 'ifr-height'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'src':
        this.updateIframeSrc();
        break;
      default:
        break;
    }
    this.updateStyles();
  }
}

BpassSelector.DEF_CONFIG = {
  IFR_MIN_WIDTH: 246,
  IFR_MAX_WIDTH: 300,
  IFR_DEFAULT_WIDTH: 300,
  IFR_MIN_HEIGHT: 105,
  IFR_MAX_HEIGHT: 350,
  IFR_DEFAULT_HEIGHT: 90,
};

function _drawerInnerElements() {
  const shadow = this.shadowRoot;

  const styles = document.createElement('style');
  shadow.appendChild(styles);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('frameborder', 0);
  iframe.setAttribute('id', `__ifr__${nanoid()}`);

  shadow.appendChild(iframe);
}

function _updateIframeStyles() {
  const shadow = this.shadowRoot;
  const conf = BpassSelector.DEF_CONFIG;
  let width = this.getAttribute('i-width'),
    height = this.getAttribute('i-height') || 0,
    ifrHeight = this.getAttribute('ifr-height');
  let left = this.getAttribute('i-left') || 0,
    top = this.getAttribute('i-top') || 0;

  width =
    !width || parseInt(width) > conf.IFR_MAX_WIDTH || parseInt(width) < conf.IFR_MIN_WIDTH
      ? conf.IFR_DEFAULT_WIDTH
      : parseFloat(width);

  ifrHeight = !ifrHeight ? conf.IFR_DEFAULT_HEIGHT : parseFloat(ifrHeight);

  top = parseInt(top) + parseInt(height) + 2;

  let style = shadow.querySelector('style');
  if (!style) {
    style = document.createElement('style');
    shadow.insertBefore(style, shadow.firstChild);
  }

  style.textContent = `
      iframe {
        all:initial;
        position:fixed;
        float:left;
        left:${left}px;
        top:${top}px;
        width:${width}px;
        height:${ifrHeight}px;
        box-sizing:border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        background:transparent;
        box-shadow:none;
        border-radius: 0px;
        border: 0px solid rgba(0,0,0,0);
        overflow-x:hidden;
      }

      html,body {
        background:transparent;
        scrollbar-width: none;
      }
      * {
        scrollbar-width: none;
      }
  `;

  var posiChains = window.__bpTopPosiChains;

  console.log('__bpTopPosiChains>>>>>>>>>>>>>&&&&&&&&&>>>>', posiChains);
}

function _updateIframeSrc() {
  const shadow = this.shadowRoot;
  const src = this.getAttribute('src');
  if (!src) {
    logger.warn('Attation : no iframe src value.');
    return;
  }

  let iframe = shadow.querySelector('iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', 0);
    iframe.setAttribute('id', `__ifr__${nanoid()}`);
    iframe.setAttribute('src', src);

    shadow.insertAfter(iframe, shadow.lastChild);
    // insertAdjacentElement is new API can't used in shadowRoot
    // shadow.insertAdjacentElement('beforeend',iframe);
  } else {
    iframe.setAttribute('src', src);
  }
}

export const BPASS_SELECTOR_TAG = 'bpass-selector';
export default BpassSelector;
