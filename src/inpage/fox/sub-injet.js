import { nanoid } from 'nanoid';

import logger from '@lib/logger';
import { LOG_LEVEL } from '@lib/code-settings';
import { shouldActivedJet } from '../injet-helper';
import { BPASS_BUTTON_TAG, BpassButton } from '../libs/bpass-button';

import FieldController from '../libs/field-controller';

const browser = require('webextension-polyfill');

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-24
 *    @comments:
 **********************************************************************/

if (shouldActivedJet()) {
  const extid = browser.runtime.id;

  window.customElements.define(BPASS_BUTTON_TAG, BpassButton);
  startup(extid).catch((err) => {
    logger.warn('SubJetStartup failed.', err);
  });
}

/**
 * subInjet Startup
 */
async function startup(extid) {
  //make sure dom element rendered
  await domIsReady();

  //
  const controller = new FieldController({ extid });
  logger.debug('Sub script injected.>>>>>>>>>>>>>>>>>>', LOG_LEVEL, extid);
  if (LOG_LEVEL === 'DEBUG') {
    window.fctx = controller;
  }
  controller.checkLoginForm();
}

/**
 * Management Position Message
 * @param {string} uuid
 * @param {string} extid
 */
function injectNumSeven(uuid, extid) {
  const jectContent = `
    (function(id,extid){

      function BPListenerChain(id,extId){
        this.uuid = id;
        this.extId = extid;
        this.nodeRootHref = \"${window.location.href}\";
        this.needLookup = ${window.parent !== window.top};
      }

      BPListenerChain.prototype.startListner = function (){

        window.addEventListener('message',(evt)=>{
          const recData = evt.data

          if(recData && recData.extid === this.extId && recData.nodeRootHref){
            console.log("RECEIVED:BP>>>>>>>>>>>>>>",recData)
            const findHref = recData.nodeRootHref
            const ifrPosi = {
              uuid:recData.posterId,
              iframeSrc:recData.nodeRootHref
            }
            const isContinue = window.self !== window.parent

            const transportMessage = {
              extid:this.extId,
              posterId: this.uuid,
              nodeRootHref:window.location.href,
              domRects:recData.domRects||[]
            }
            console.log('Lookup href',findHref)
            let domRect = false;
            document.querySelectorAll('iframe').forEach(ifr =>{
              if(ifr.src === findHref) {
                domRect = ifr.getBoundingClientRect()
              }
            })

            if(domRect){
              ifrPosi.domRect = domRect
              transportMessage.domRects.push(ifrPosi)

              if(isContinue) {
                window.parent.postMessage(transportMessage,"*")
              }else {
                window.__BPTopPosiChains = transportMessage.domRects

                //if Selector find update position
              }
            }
          }else {
            console.warn('may be an error occurred for find iframe.')
          }
        });
      }

      BPListenerChain.prototype.startResizeListener = function(){
        console.log("Start Resize listener.....")
      }

      window.__bPListenerChain = new BPListenerChain(id,extid);
      window.__bPListenerChain.startListner();

    })(\"${uuid}\",\"${extid}\");
  `;

  //logger.debug('inject js', jectContent)

  try {
    const domContainer = document.head || document.documentElement;

    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.textContent = jectContent;

    scriptEl.onload = function () {
      if (LOG_LEVEL !== 'DEBUG') {
        this.parentNode.removeChild(this);
      }
    };

    domContainer.appendChild(scriptEl);
    logger.debug('injectmessage success.');
  } catch (error) {
    logger.debug('injectmessage failed.', error);
  }
}

function startupInjet() {
  logger.debug('Sub script injected.>>>>>>>>>>>>>>>>>>');
}

async function domIsReady() {
  if (['interactive', 'complete'].includes(document.readyState)) {
    return true;
  }

  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true })
  );
}
