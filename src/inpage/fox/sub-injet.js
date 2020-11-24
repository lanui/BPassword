import { nanoid } from 'nanoid';
import logger from '@lib/logger';
import { shouldActivedJet } from '../injet-helper';

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
  const jet7id = nanoid();

  domIsReady().then((ret) => {
    injectNumSeven(jet7id, 'BPassword-extId');
  });
}

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

      window.bPListenerChain = new BPListenerChain(id,extid);
      window.bPListenerChain.startListner();

    })(\"${uuid}\",\"${extid}\");
  `;

  //logger.debug('inject js', jectContent)

  try {
    const domContainer = document.head || document.documentElement;

    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('async', 'false');
    scriptEl.textContent = jectContent;

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
