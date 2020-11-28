import extension from '../extensionizer';

import { nanoid } from 'nanoid';

import { ENV_TYPE_POPUP, BROWSER_CHROME, BROWSER_FIREFOX } from '../enums';
import { extTarget } from '../code-settings';

import logger from '@/libs/logger';

/*********************************************************************
 * AircraftClass ::
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-07
 **********************************************************************/
class WhispererController {
  constructor(opts = {}) {
    this.portName = opts.portName || nanoid();
    this.includeTlsChannelId = Boolean(opts.includeTlsChannelId);
    this.extid = opts.extid || extension.runtime.id;
  }

  async sendSimpleMessage(apiType, data) {
    const message = { apiType, reqData: data };

    if (extTarget === BROWSER_CHROME) {
      return crxSendMessage.call(this, message);
    }

    if (extTarget === BROWSER_FIREFOX) {
      return foxSendMessage.call(this, message);
    }

    return Promise.reject('Unspport extension:' + extTarget);
  }
}

async function foxSendMessage(message) {
  logger.debug(
    `WhispererController:sendSimpleMessage - ${this.portName}-${extTarget}>>>>>`,
    this.extid,
    message
  );
  try {
    const respData = await extension.runtime.sendMessage(this.extid, message);
    // logger.debug('WhispererController:sendSimpleMessage:received -fox>>>', respData);
    return respData;
  } catch (err) {
    logger.debug('WhispererController:sendSimpleMessage:received -fox>>>', err);
    throw err;
  }

  // return new Promise((resolve,reject) =>{
  //   extension.runtime.sendMessage(this.extid, message).then(respData=>{
  //     logger.debug('WhispererController:sendSimpleMessage:received>>>', respData)
  //     return resolve(respData)
  //   }).catch(err=>{
  //     logger.debug('WhispererController:sendSimpleMessage:received>>>', err)
  //     return reject(err)
  //   })
  // })
}

async function crxSendMessage(message) {
  logger.debug(
    `WhispererController:sendSimpleMessage - ${this.portName}-${extTarget}>>>>>`,
    this.extid,
    message
  );
  return new Promise((resolve, reject) => {
    try {
      extension.runtime.sendMessage(
        message,
        { includeTlsChannelId: this.includeTlsChannelId },
        (respMessage) => {
          logger.debug(
            `WhispererController:sendSimpleMessage - ${this.portName} >>>>>`,
            respMessage
          );
          if (typeof respMessage === 'object' && respMessage.error) {
            reject(respMessage.error);
          } else if (typeof respMessage === 'object' && respMessage.data) {
            resolve(respMessage.data);
          } else {
            resolve(true);
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

export default WhispererController;
