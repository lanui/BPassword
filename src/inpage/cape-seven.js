import { nanoid } from 'nanoid';

import { shouldActivedJet } from './injet-helper';
import { API_FETCH_EXT_STATE } from '@lib/msgapi/api-types';
const browser = require('webextension-polyfill');
import logger from '@lib/logger';
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
  // browser.runtime.sendMessage({
  //   apiType: API_FETCH_EXT_STATE,
  //   reqData: { fetch: 'InjetExtInfo' },
  // }).then(configState => {
  //   const { extid } = configState
  //   const uuid = nanoid()

  // }).catch(err => {
  //   logger.warn('BPassword failed.', err);
  // });

  const uuid = nanoid();
  const leechSrc = browser.runtime.getURL('leech/leech.html');
  const extid = browser.runtime.id;
  logger.debug('Cape7>>>>>>>', window.location.href, browser.runtime.getURL('leech/leech.html'));
  inJectNo7(uuid, extid, leechSrc);
}

function inJectNo7(uuid, extid, leechSrc) {
  const jetContent = `
    (function(id,extid,leechSrc){
      function BPListenerChain(id,extId,leechSrc){
        this.uuid = id;
        this.extid = extid;
        this.leechSrc = leechSrc;
        this.nodeRootHref = \"${window.location.href}\";
        this.needLookup = ${window.parent !== window.top};
      }

      BPListenerChain.leechSrc = leechSrc

      BPListenerChain.prototype.startListener = function (){
        window.addEventListener('message',(evt)=>{
          const recData = evt.data;

          if(recData && recData.extid === this.extid && recData.nodeRootHref){
            console.log("RECEIVED:BP>>>>>>>>>>>>>>",recData)

            const findHref = recData.nodeRootHref
            const uuid = recData.posterId,
            const ifrPosi = {
              uuid:uuid,
              iframeSrc:findHref
            };
            const isContinue = (window.self !== window.parent);

            const transportMessage = {
              extid:this.extId,
              posterId: this.uuid,
              nodeRootHref:window.location.href,
              domRects:recData.domRects||[]
            };


            let domRect = false;
            document.querySelectorAll('iframe').forEach(ifr =>{
              console.log('Lookup href result>>>',findHref,ifr.src,isContinue)
              if(ifr.src === findHref) {
                domRect = ifr.getBoundingClientRect()
              }
            });

            console.log('Lookup href result>>>',window.location.href,domRect,isContinue)

            if(domRect){
              ifrPosi.domRect = domRect
              transportMessage.domRects.push(ifrPosi)

              this.domRects = transportMessage.domRects
              if(isContinue) {
                window.parent.postMessage(transportMessage,"*")
              }else {
                window.__BPTopPosiChains = transportMessage.domRects
                //if Selector find update position
              }
            }else {
              this.domRects = transportMessage.domRects
              // Zero Level
              window.__BPTopPosiChains = transportMessage.domRects
            }
          }else {
            // console.warn('may be an error occurred for find iframe.')
          }
        });
      }

      BPListenerChain.prototype.startResizeListener = function(){
        /** resize  */
        console.log("Start Resize listener.....")
      }

      window.__bPListenerChain = new BPListenerChain(id,extid,leechSrc);
      window.__bPListenerChain.startListener();
    })(\"${uuid}\",\"${extid}\",\"${leechSrc}\")
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
    logger.debug('inject cape 7 message success.');
  } catch (err) {
    logger.debug('inject cape 7 message failed.', error);
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
