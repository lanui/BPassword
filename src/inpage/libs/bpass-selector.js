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

    const shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {}

  disconnectedCallback() {
    //在元素从文档移除到时候，浏览器会调用这个方法
  }

  static get observedAttributes() {
    /* 属性数组，这些属性的变化会被被监视 */
    return ['icon-size', 'target-width', 'target-height', 'target-left', 'target-top'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.updateStyles();
  }
}
