import logger from '@/libs/logger';
import { getUUID } from './comm-utils';

export const IFR_MIN_HEIGHT = 105;
export const IFR_MAX_HEIGHT = 350;
export const IFR_MIN_WIDTH = 246;
export const IFR_MAX_WIDTH = 300;
export const IFR_DEFAULT_WIDTH = 300;
export const SELECTOR_OPTIONS_TAG = 'bp-selector-options';
export const IFR_LOCKED_HEIGHT = 90;

/*********************************************************************
 * AircraftClass :: SelectorOptions
 *     @Description: height base : row height 40,maxRows 6
 *     maxHeight: outer-border= 1*2  v-scoll= (8+4 + 6*40) footer = (1+8 + 28 + 8)=45
 *     base (2+ 12+45 ) :  59 + 40 = 99 ≈ 100
 *
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-10
 **********************************************************************/
export class SelectorOptions extends HTMLElement {
  constructor() {
    super();

    this.width = IFR_MIN_WIDTH;
    this.height = IFR_MIN_HEIGHT;

    this.position = {
      left: 0,
      top: 0,
      width: IFR_DEFAULT_WIDTH,
    };

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    const shadowRoot = this.shadowRoot;
    shadowRoot.addEventListener('mousedown', (e) => {
      logger.debug('Top injet:shadowRoot@mousedown', e);
      //阻止监听同一事件的其他事件监听器被调用。
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    const style = document.createElement('style');

    shadowRoot.appendChild(style);

    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', `__ifr__${getUUID()}`);
    iframe.setAttribute('allowTransparency', true);
    iframe.setAttribute('frameborder', 0);

    shadowRoot.appendChild(iframe);
  }

  updatePosition(position) {
    const { left, top, width } = position;
    if (typeof left == 'number') this.position.left = left;
    if (typeof top == 'number') this.position.top = top;
    if (typeof width == 'number') this.position.width = width;
    this._updateIframeStyle();
  }

  updateWidth(width) {
    if (typeof width == 'number') this.position.width = width;
    this._updateIframeStyle();
  }

  connectedCallback() {
    // 在元素被添加到文档之后，浏览器会调用这个方法
    // console.log('SelectorOptions created.>>>>');
    this._updateIframeStyle();
  }

  disconnectedCallback() {
    // 在元素从文档移除到时候，浏览器会调用这个方法
    //TODO remove top iframe selector
    // console.log('SelectorOptions remove>>>>');
  }

  static get observedAttributes() {
    /* 属性数组，这些属性的变化会被被监视 */
    return ['src', 'unlocked', 'rows', 'i-height', 'is-hidden'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log(`SelectorOptions Attribute changed :${name} >>>>`, oldValue, newValue);

    const ifr = this.shadowRoot.querySelector('iframe');

    switch (name) {
      case 'src':
        if (newValue && ifr) ifr.setAttribute('src', newValue);
        break;
      case 'unlocked':
      case 'rows':
        // logger.debug('SelectorElement attribute changed', name, newValue);
        this._updateIframeStyle();
        break;
      case 'i-height':
        this._updateIfrHeight(newValue);
        break;
      default:
        break;
    }
  }

  _updateIfrHeight(iHeight) {
    const shadowRoot = this.shadowRoot;
    const { left, top, width } = this.position;

    let w = width > IFR_MAX_WIDTH ? IFR_MAX_WIDTH : width < IFR_MIN_WIDTH ? IFR_MIN_WIDTH : width;

    // const rows = this.getAttribute('rows') || 0;

    // const _unlocked = this.getAttribute('unlocked');
    // const unlocked = _unlocked === null || _unlocked == 'false' ? false : Boolean(_unlocked);

    let ifrHeight = iHeight;
    // if (!unlocked) ifrHeight = IFR_LOCKED_HEIGHT;
    // clacIframeHeight({ unlocked, rows });

    shadowRoot.querySelector('style').textContent = `
      iframe {
        all:initial;
        position:fixed;
        float:left;
        left:${left}px;
        top:${top}px;
        width:${w}px;
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
      }
    `;
  }

  _updateIframeStyle() {
    const shadowRoot = this.shadowRoot;
    const { left, top, width } = this.position;

    let w = width > IFR_MAX_WIDTH || IFR_MAX_WIDTH < IFR_MIN_WIDTH ? IFR_DEFAULT_WIDTH : width;
    let iHeight = this.getAttribute('i-height') || 0;

    const rows = this.getAttribute('rows') || 0;

    // let ifrHeight = iHeight > 0 ? iHeight : clacIframeHeight({ unlocked, rows });

    shadowRoot.querySelector('style').textContent = `
      iframe {
        all:initial;
        position:fixed;
        float:left;
        left:${left}px;
        top:${top}px;
        width:${w}px;
        height:${iHeight}px;
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
        background-color:#FFF;
        filter:alpha(Opacity=0);
        -moz-opacity:0;
        opacity: 0;
      }
    `;
  }
}

function clacIframeHeight({ unlocked = false, rows = 0 }) {
  const baseHeight = 46; //(2:border+ 12:padding  + 32:footer  + 5 diff)
  const rowHeight = 40;
  const maxRows = 6;

  const addBtnHeight = 50;
  if (rows === 0) return addBtnHeight;

  let calcRows = rows < 1 ? 1 : rows > maxRows ? maxRows : rows;

  return unlocked ? baseHeight + calcRows * rowHeight : IFR_LOCKED_HEIGHT;
}

export default SelectorOptions;
