import EventEmitter from 'events';

import logger from '../logger';
import extension from '../extensionizer';

import { ENV_TYPE_INJET } from '../enums';
import {
  API_JET_INIT_STATE,
  API_RT_FILL_FEILDS,
  API_RT_VALT_CHANGED_TRANS_NOTIFY,
} from '@/libs/msgapi/api-types';

/*********************************************************************
 * AircraftClass ::
 *     @Description: Zombie will attched on pages
 *     @Description: Follow the command of the corpse chaser
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-09
 **********************************************************************/
class CorpseChaser extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.setMaxListeners(10);
    this.portName = opts.portName || ENV_TYPE_INJET;
    this.includeTlsChannelId = Boolean(opts.includeTlsChannelId);
    this.hostname = opts.hostname;

    // updateMatchedState update initState to feildsPage and topPage
    this.updateMatchedState = opts.updateMatchedState;
    this.filledInputFeilds = opts.filledInputFeilds;
    this.valtChangedHandler = opts.valtChangedHandler;

    // this.once('startup:zombie',this.startupZombie.bind(this))
  }

  startupZombie({ hostname = '', extid = '' }) {
    logger.debug(`start listening corpse commands...${this.portName}>>>`, hostname, extid);

    if (hostname) this.hostname = hostname;

    if (extid) {
      this.remote = extension.runtime.connect(extid, {
        name: this.portName,
        includeTlsChannelId: this.includeTlsChannelId,
      });
    } else {
      this.remote = extension.runtime.connect({
        name: this.portName,
        includeTlsChannelId: this.includeTlsChannelId,
      });
    }

    this.remote.onMessage.addListener(this.remoteCommandsListener.bind(this));

    if (hostname) {
      // send hostname
      this.remote.postMessage({
        apiType: 'updateLoginHostname',
        hostname,
      });
    }
  }

  /**
   *
   * @param {*} apiType
   * @param {*} data
   */
  postMessage(apiType, data) {
    if (this.remote) {
      const message = {
        apiType: apiType,
        data: data,
      };

      this.remote.postMessage(message);
    }
  }

  remoteCommandsListener(message) {
    if (message && message.name && message.data) {
      const { apiType, respData } = message.data;
      logger.debug(
        `CorpseChaser Received corpse commands [${this.portName}]: ${apiType}>>>`,
        respData
      );

      switch (apiType) {
        case API_JET_INIT_STATE:
          this.updateMatchedState && this.updateMatchedState(respData);
          break;
        case API_RT_FILL_FEILDS:
          this.filledInputFeilds && this.filledInputFeilds(respData);
          break;
        case API_RT_VALT_CHANGED_TRANS_NOTIFY:
          this.valtChangedHandler && this.valtChangedHandler(respData);
          break;
        default:
          break;
      }
    }
  }
}

export default CorpseChaser;
