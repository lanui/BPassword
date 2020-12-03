import { nanoid } from 'nanoid';

import { shouldActivedJet } from './injet-helper';
import { API_FETCH_EXT_STATE } from '@lib/msgapi/api-types';
const browser = require('webextension-polyfill');
import logger from '@lib/logger';
import { LOG_LEVEL } from '@lib/code-settings';
/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-25
 *    @comments: Optimization Position report chains
 **********************************************************************/

if (shouldActivedJet()) {
  startup();
}

async function startup() {
  await domIsReady();
  fetchExtensionConfig();
}

function fetchExtensionConfig() {
  const uuid = nanoid();
  const leechSrc = browser.runtime.getURL('leech/leech.html');
  const extid = browser.runtime.id;
  // logger.debug('Cape7>>>>>>>', window.location.href, browser.runtime.getURL('leech/leech.html'));
  inJectNo7(uuid, extid, leechSrc);
}

function inJectNo7(uuid, extid, leechSrc) {
  const jetContent = `
    (function(uuid,extid,leechSrc,ll){
      /*if(ll==='DEBUG'){console.log("Starting BPListenerChain:",uuid,extid,leechSrc,ll);}*/

      function BPListenerChain(){
        this.uuid = uuid;
        this.extid = extid;
        this.leechSrc = leechSrc;
        this.nodeRootHref = \"${window.location.href}\";
        this.needLookup = ${window.parent !== window.top};
      }

      BPListenerChain.leechSrc = leechSrc
      BPListenerChain.extid = extid

      BPListenerChain.prototype.startListener = function(){
        const _this = this;
        window.addEventListener('message',(evt)=>{
          /**console.log('No Seven Received :',evt); */
          
          const recData = evt.data
          if(recData && recData.extid && recData.extid === _this.extid){
            (ll==='DEBUG')&&console.log('No Seven Received data:',recData);
            const findHref = recData.nodeRootHref;
            const recPosterId = recData.posterId;

            const transportMessage = {
              extid:_this.extid,
              posterId: _this.uuid,
              nodeRootHref:window.location.href,
              domRects:Object.assign([],recData.domRects||[])
            };

            let domRect = false;
            document.querySelectorAll('iframe').forEach(ifr =>{
              /** console.log('Matched Href:',ifr.src , findHref); */
              if(ifr.src === findHref) {
                domRect = ifr.getBoundingClientRect();
              }
            })

            const isContinue = window.self !== window.parent
            const ifrPosi = {
              uuid:recPosterId,
              iframeSrc:findHref
            };

            if(domRect) {/** find iframe */
              ifrPosi.domRect = JSON.parse(JSON.stringify(domRect));
              transportMessage.domRects.push(ifrPosi);

              _this.domRects = Object.assign([],transportMessage.domRects);

              if(isContinue){
                window.parent.postMessage(transportMessage,"*");
              }else{
                window.__bpTopPosiChains = transportMessage.domRects;
              }
            }else{
              /** unfound iframe, */
              _this.domRects = Object.assign([],transportMessage.domRects);
              window.__bpTopPosiChains = transportMessage.domRects;
            }
            /**/
            (window.self===window.top) && document.querySelector('selector-box') && document.querySelector('selector-box').setAttribute('uts',new Date());
          }else {
            /** not BP system Message */
          }
        });
      }

      window.__bPListenerChain = new BPListenerChain();
      window.__bPListenerChain.startListener();
    })("${uuid}","${extid}","${leechSrc}","${LOG_LEVEL}");
  `;

  // Inject

  try {
    const domContainer = document.head || document.documentElement;

    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.textContent = jetContent;

    scriptEl.onload = function () {
      if (LOG_LEVEL !== 'DEBUG') {
        this.parentNode.removeChild(this);
      }
    };

    domContainer.appendChild(scriptEl);
    // logger.debug('inject cape 7 message success.');
  } catch (err) {
    logger.warn('inject cape 7 message failed.', error);
  }
}

function injectBpassIcon(extid, leechSrc) {}

async function domIsReady() {
  if (['interactive', 'complete'].includes(document.readyState)) {
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
