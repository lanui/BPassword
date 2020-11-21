import iconUrl from '../assets/icons/icon-logo-circle.png';

import {
  API_WIN_SELECTOR_DRAWER,
  API_WIN_SELECTOR_TOGGLE,
  API_WIN_SELECTOR_ERASER,
} from '@/libs/msgapi/api-types.js';

/**
 *
 */
export class BpassButton extends HTMLElement {
  constructor() {
    super();
    this.iconPosition = {
      left: 0,
      top: 0,
      size: BpassButton.medium,
    };
    this.activedTarget = null;
    this.activedPosition = {};
    this.iconUrl = iconUrl;

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    _drawInnerElements.call(this);
  }

  setActivedTarget(elem) {
    this.activedTarget = elem;
  }

  setActivedPosition(activedPosition = {}) {
    this.activedPosition = activedPosition;
    _updateIconPosition.call(this);
  }

  getActivedValue() {
    return this.activedTarget !== null ? this.activedTarget.value : '';
  }

  getActivedPosition() {
    return this.activedPosition || {};
  }

  connectedCallback() {
    // 在元素被添加到文档之后，浏览器会调用这个方法
    const isInner = this.getAttribute('is-inner');

    // _drawInnerElements.call(this)

    let message = {
      apiType: API_WIN_SELECTOR_DRAWER,
      position: this.getActivedPosition(),
      activedValue: this.getActivedValue(),
      innerHref: window.location.href,
      isInner: this.getAttribute('is-inner'),
    };

    // window.top.postMessage(message, '*');

    _updateIconPosition.call(this);
  }

  disconnectedCallback() {
    // 在元素从文档移除到时候，浏览器会调用这个方法
    //TODO remove top iframe selector

    const isInner = this.getAttribute('is-inner');
    let message = {
      apiType: API_WIN_SELECTOR_ERASER,
      isInner: this.getAttribute('is-inner'),
    };

    window.top.postMessage(message, '*');
  }

  getActivedHeight() {
    let h = this.activedTarget ? this.activedTarget.getBoundingClientRect().height : 0;
    return h;
  }

  static get observedAttributes() {
    /* 属性数组，这些属性的变化会被被监视 */
    return ['is-inner', 'active-field'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'is-inner') {
      // console.log('>>>>>>>>>>>>is-inner>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', newValue);
    }
  }
}

BpassButton.medium = 16;
BpassButton.large = 26;
BpassButton.small = 12;

BpassButton.generateid = (prefix) => {
  let uuid = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return typeof prefix === 'string' ? `${prefix.trim()}-${uuid}` : `bpass-${uuid}`;
};

BpassButton.calcIconSize = (h) => {
  if (!h) return 0;
  if (parseFloat(h) >= 38) return BpassButton.large;
  if (parseFloat(h) >= BpassButton.medium + 4) return BpassButton.medium;
  return BpassButton.small;
};

function _drawInnerElements() {
  const shadowRoot = this.shadowRoot;
  const button = document.createElement('button');
  this.iconId = BpassButton.generateid('BP');
  button.setAttribute('id', this.iconId);
  button.textContent = '';
  const style = document.createElement('style');

  shadowRoot.appendChild(style);
  shadowRoot.appendChild(button);

  shadowRoot.addEventListener('mousedown', (e) => {
    //阻止监听同一事件的其他事件监听器被调用。
    e.stopImmediatePropagation();
    e.preventDefault();
  });

  shadowRoot.addEventListener('click', (e) => {
    //this=bpass-button
    // console.log('ShadowRoot onclick', window.location.href, window.top.postMessage);

    // let message = {
    //   apiType: API_WIN_SELECTOR_TOGGLE,
    //   position: this.getActivedPosition(),
    //   activedValue: this.getActivedValue(),
    //   innerHref: window.location.href,
    //   isInner: this.getAttribute('is-inner'),
    // };

    // window.top.postMessage(message, '*');

    let onClickFn = this.onClick;
    if (e.target && onClickFn) {
      onClickFn.call(e.target);
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

function _updateIconPosition() {
  const shadowRoot = this.shadowRoot;
  const activedPosition = this.activedPosition || {};
  const { left = 0, top = 0, height = 0, width = 0, x = 0, y = 0, paddingY = 0 } = activedPosition;

  //Icon
  const iconSize = BpassButton.calcIconSize(height);

  let space = Math.max((height - iconSize) / 2, paddingY),
    iconLeft = left + (width - iconSize - space),
    iconTop = top + space;

  shadowRoot.querySelector('style').textContent = `
    button {
      all:initial;
      cursor:pointer;
      position:fixed;
      float:left;
      top:${iconTop}px;
      left:${iconLeft}px;
      height:${iconSize}px;
      width:${iconSize}px;
      color:#8cc;
      background: url('data:image/png;base64,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') center center no-repeat;
      background-size: cover;
      border:none;
      outline:0;
    }
  `;
}

export const BPASS_BUTTON_TAG = 'bpass-button';

export default BpassButton;
