import { nanoid } from 'nanoid';

import logger from '@lib/logger';
import { shouldActivedJet } from './injet-helper';
import { LOG_LEVEL } from '@lib/code-settings';
const browser = require('webextension-polyfill');

/*********************************************************************
 * AircraftClass ::
 *    @description: This inject source support firefox >53,Chrome > 51
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-27
 *    @comments:
 **********************************************************************/
const LEECH_INDEX_PATH = 'leech/leech.html';
const LEECH_ADDOR_PATH = 'leech/leech.html#/add_passbook';

if (shouldActivedJet()) {
  /** generate jetid will report Backend */
  let jetid = `bp_${nanoid()}`;

  startupInject(jetid);
}

/**
 * Inject Source Entry
 * @param {string} jetid
 */
async function startupInject(jetid) {
  await domIsReady();
  // logger.debug(`BPassword inject [${jetid}] starting...`);
  const jetSource = chanel5builder(jetid);
  injectSourceIntoDom(jetSource, jetid);
}

function chanel5builder(jetid) {
  const serializeConfig = getExtInfo(jetid);

  /* use strict */
  let jetOne = `
    /**BPassword inject ${jetid} */\n
    !(function(jetid,serializeConfig,logLevel){
      const BP_CONFIG = JSON.parse(serializeConfig);
      class SelectorBox extends HTMLElement {
        constructor(){
          super();
          this.config = BP_CONFIG;

          let shadow = this.shadowRoot;
          if(!shadow){
            shadow = this.attachShadow({mode:'open'});
          }

          shadow.addEventListener('mousedown',(e) =>{
            if(logLevel === 'DEBUG'){console.log('Selector Box @mousedown',e);}
            e.stopImmediatePropagation();
            e.preventDefault();
          })

          _drawerInnerElements.call(this);

          this.updateIframeSrc = _updateIframeSrc.bind(this);
          this.updateStyles = _updateSelectorBoxStyles.bind(this);
        }

        connectedCallback(){
          this.updateIframeSrc();
          this.updateStyles();
        }

        disconnectedCallback(){

        }

        static get observedAttributes() {
          return ['src', 'at-width', 'at-height', 'at-left', 'at-top', 'ifr-height','is-inner','at-href'];
        }

        attributeChangedCallback(name, oldValue, newValue){
          if(logLevel === 'DEBUG'){
            console.log('Selector Box attributeChangedCallback:',name,newValue);
          }
          switch(name){
            case 'src':
              this.updateIframeSrc();
              break;
            default:
              break;
          }
          this.updateStyles();
        }
      }

      SelectorBox.prototype.generateUUID = function() {
        let id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
        return id;
      }

      SelectorBox.prototype.getIfrConfig = function(){
        return {
          IFR_MIN_WIDTH: 246,
          IFR_MAX_WIDTH: 300,
          IFR_DEFAULT_WIDTH: 300,
          IFR_MIN_HEIGHT: 105,
          IFR_MAX_HEIGHT: 350,
          IFR_DEFAULT_HEIGHT: 90
        }
      }

      SelectorBox.prototype.calcIfrWidth = function(atWidth){
        const ifrConfig = this.getIfrConfig();
        let ifrWidth = atWidth||0;
        ifrWidth<ifrConfig.IFR_MIN_WIDTH && (ifrWidth = ifrConfig.IFR_MIN_WIDTH);
        ifrWidth>ifrConfig.IFR_MAX_WIDTH && (ifrWidth = ifrConfig.IFR_MAX_WIDTH)
        return ifrWidth
      }


      SelectorBox.CONFIG = BP_CONFIG;
      SelectorBox.DEF_IFRCONF = {
        IFR_MIN_WIDTH: 246,
        IFR_MAX_WIDTH: 300,
        IFR_DEFAULT_WIDTH: 300,
        IFR_MIN_HEIGHT: 105,
        IFR_MAX_HEIGHT: 350,
        IFR_DEFAULT_HEIGHT: 90
      };

      /* Drawing inner elements */
      function _drawerInnerElements(){
        const shadow = this.shadowRoot;

        const styles = document.createElement('style');
        shadow.appendChild(styles);

        const iframe = document.createElement('iframe');
        iframe.setAttribute('frameborder', 0);
        iframe.setAttribute('src',this.config.leechSrc||'');
        iframe.setAttribute('id', '__ifr__'+ this.generateUUID());

        shadow.appendChild(iframe);
      }


      function _updateSelectorBoxStyles(){
        const shadow = this.shadowRoot;
        if(!shadow){/*warn*/console.warn('selector-box disabled.');return;}
        const isInner = this.hasAttribute('is-inner');
        const atHref = this.getAttribute('at-href')||'';
        const atHeight = this.getAttribute('at-height')||0;

        const atWidth = this.getAttribute('at-width')||0;

        if(!atHeight){
          return;
        }

        if(logLevel==='DEBUG'){console.log('Has position:',window.__bpTopPosiChains);}
        let posiState = {
          left:0,
          top:0,
          "atHeight":atHeight,
          "atWidth":atWidth,
          "atHref":atHref,
          enabled:false
        };

        if(window.__bpTopPosiChains){
          posiState = sizeReducer(window.__bpTopPosiChains,posiState);
          console.log('sizeCalcultor result:',posiState);
        }
        const hasAtleft = this.hasAttribute('at-left');
        const hasAtTop = this.hasAttribute('at-left');
        let atLeft = this.getAttribute('at-left')||0,atTop = this.getAttribute('at-top')||0;
        if(!posiState.enabled){
          /* miss params unhandle */
          posiState.left = atLeft;
          posiState.top = atTop + atHeight;
        }else {/**/}

        const ifrWidth = this.calcIfrWidth(posiState.atWidth);
        const ifrHeight = this.getAttribute('ifr-height')||90;

        let style = shadow.querySelector('style');
        const styleExists = !!style;
        if(!styleExists){style=document.createElement('style');}

        style.textContent = 'iframe {all:initial;position:fixed;float:left;' +
          'left:'+posiState.left+'px;' +
          'top:'+posiState.top+'px;' +
          'width:'+ifrWidth+'px;'+
          'height:'+ ifrHeight +'px;'+
          'box-sizing:border-box;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;background:transparent;' +
          'box-shadow:none;border-radius: 0px;border: 0px solid rgba(0,0,0,0);overflow-x:hidden;'+
          'overflow-y:hidden;}' +
          'html,body {background:transparent;scrollbar-width: none;} ' +
          '* {scrollbar-width: none;}';

        if(!styleExists){
          shadow.insertBefore(style, shadow.firstChild);
        }
      }

      function _updateIframeSrc(){
         const shadow = this.shadowRoot;
         const src = this.getAttribute('src');
         if(!src){return;}
         let iframe = shadow.querySelector('iframe');
         const ifrExists = !!iframe;

         if(!ifrExists){
            iframe = document.createElement('iframe');
            iframe.setAttribute('frameborder', 0);
            iframe.setAttribute('id', '__ifr__'+ this.generateUUID());
         }
         iframe.setAttribute('src',src);
         if(!ifrExists){
           shadow.insertAfter(iframe, shadow.lastChild);
         }
      }

      function sizeReducer(posiChains,initState){
        if(logLevel==='DEBUG'){console.log('sizeReducer starting:',posiChains,initState);}
        if(typeof initState !== 'object' ){
          initState = {
            left:0,
            top:0,
            atHeight:0,
            atWidth:0,
            atHref:'',
            enabled:false
          };
        }else {
          initState.left = initState.left ||0;
          initState.top = initState.top||0;
        }

        let posiState = (posiChains||[]).reduce((state,posi) => {
          if(logLevel==='DEBUG'){console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&---->>",posi);}
          if(posi && posi.domRect){
            state.enabled = true;
            let left = (posi.domRect.left||0),top = (posi.domRect.top||0);
            state.left = state.left + left;
            state.top += top;

            if(posi.activedField){
              state.atHeight = posi.domRect.height||state.atHeight;
              state.atHref = posi.iframeSrc||state.atHref;
              state.atWidth = posi.domRect.width||state.atWidth;
              state.top += state.atHeight;
            }
          }
          return state;
        },initState);

        return posiState;
      }

      /* registing */
      window.__SelectorBox = SelectorBox;
      try {
        window.customElements.define('selector-box', SelectorBox);
      } catch (err) {
        console.warn('Registing custom element.', err);
      }
    })('${jetid}','${serializeConfig}','${LOG_LEVEL}');
  `;

  return jetOne;
}

function getExtInfo(jetid) {
  const baseUrl = browser.runtime.getURL('');

  const config = {
    jetid,
    extid: browser.runtime.id,
    leechSrc: browser.runtime.getURL(LEECH_INDEX_PATH),
    leechAddorSrc: browser.runtime.getURL(LEECH_ADDOR_PATH),
    baseUrl,
  };

  const serializeParams = JSON.stringify(config);
  return serializeParams;
}

function closerJet(uuid, fns) {
  const closerBegin = '(function (';
  const closerAgrsBegin = '){';
  const closerMainEnd = '})(';

  const closerEnd = ')';
}

function injectSourceIntoDom(content, tag) {
  if (!content) {
    return;
  }
  try {
    logger.debug(`BPassword inject [${tag}] starting...`);
    const domContainer = document.head || document.documentElement;
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.setAttribute('charet', 'UTF-8');
    scriptEl.textContent = content;

    scriptEl.onload = function () {
      if (LOG_LEVEL !== 'DEBUG') {
        //this.parentNode.removeChild(this);
      }
    };

    domContainer.appendChild(scriptEl);
    logger.debug(`BPassword inject [${tag}] completed.`);
  } catch (error) {
    logger.debug(`BPassword inject [${tag}] failed.`, error.message);
  }
}

async function domIsReady() {
  if (['interactive', 'complete'].includes(document.readyState)) {
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
