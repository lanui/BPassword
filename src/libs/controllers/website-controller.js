import _ from 'lodash';
import EventEmitter from 'events';
import ObservableStore from 'obs-store';

import logger from '@/libs/logger';
import { transferTerms, getDiff } from '../utils/item-transfer';
import BPError from '../biz-error';
import { VEX_ITEM_EXIST, VEX_ITEM_EDIT, VEX_ITEM_DELETE } from '../biz-error/error-codes';
import { API_RT_FIELDS_VALT_CHANGED, API_RT_FIELDS_MATCHED_STATE } from '@/libs/msgapi/api-types';

/*********************************************************************
 * AircraftClass :: Website passbook management
 *     @Description: store encrypt data and history
 *     @Description:
 * WARNINGS:
 *     this class dependency global api data_store
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-06
 **********************************************************************/

const StateStruct = {
  blockerVersion: [], //{blockNumber,Cypher64,contactAddress,Hash,mainAddress,chainId}
  lastSyncHash: null, //save this client last sync block success hash
};

class WebsiteController extends EventEmitter {
  /**
   *
   * @param {object} opts
   *
   */
  constructor(opts = {}) {
    super();

    const initState = opts.initState || {};

    this.notifyInjet = opts.notifyInjet;
    this.getActivedMuxStream = opts.getActivedMuxStream;
    this.getActivedTopMuxStream = opts.getActivedTopMuxStream;

    this.store = new ObservableStore(Object.assign({}, StateStruct, initState));

    this.memStore = new ObservableStore();

    /**
     * tabId : {hostname,username,password}
     */
    this.activeValtStore = new ObservableStore();
    this.activeValtStore.subscribe(this.notifyLeechPageValtStateListener.bind(this));

    this.on('notify:injet:client', _.debounce(this.callNotifiedInjetClient.bind(this), 500));
  }

  /*
   *
   * @param {*} tabId
   * @param {*} valtState
   */
  updateActieTabValtState(tabId, valtState) {
    if (tabId !== undefined && valtState) {
      valtState.ctype = 'inputChanged';
      const activeState = {
        [tabId]: valtState,
      };
      this.activeValtStore.updateState(activeState);
    }
  }

  notifyLeechPageValtStateListener(activeTabState) {
    logger.debug('notifyLeechPageValtStateListener>>>>>>>>>>>>>>>>>>', activeTabState);
    if (typeof activeTabState === 'object') {
      const { items = [] } = this.memStore.getState();

      //
      const tabId = Object.keys(activeTabState)[0];
      const valtState = activeTabState[tabId];

      let matchedNum = 0,
        hostname = valtState.hostname,
        exactMatched = false;
      if (hostname) {
        const _fItems = items.filter(
          (it) => it.hostname.endsWith(hostname.trim()) || hostname.trim().endsWith(it.hostname)
        );
        matchedNum = _fItems.length;
        const { username = '', password = '' } = valtState;
        if (username && password && _fItems.length) {
          const exactItem = _fItems.find(
            (it) => it.username === username.trim() && it.password === password
          );
          exactMatched = Boolean(exactItem);
        }
      }

      if (this.getActivedMuxStream) {
        const message = {
          apiType: API_RT_FIELDS_VALT_CHANGED,
          valtState,
        };
        const muxStream = this.getActivedMuxStream(tabId);
        logger.debug('Back Send ValtState to leech muxStream', tabId, valtState, muxStream);
        if (muxStream) {
          muxStream.write(message);
        }
      }

      if (this.getActivedTopMuxStream) {
        const topStream = this.getActivedTopMuxStream(tabId);
        const topMessage = {
          matchedNum,
          exactMatched,
        };
        if (topStream) {
          topStream.write(topMessage);
        }
      }
    }
  }

  getActiveTabState(tabId, hostname) {
    const state = this.activeValtStore.getState();

    const activeTabState = state[tabId] || {
      password: '',
      username: '',
      hostname,
    };

    return activeTabState;
  }

  resetActiveTabValtState(tabId) {
    if (tabId !== undefined) {
      const activeState = {
        [tabId]: {
          ctype: 'reset',
          hostname: '',
          password: '',
          username: '',
        },
      };
      this.activeValtStore.updateState(activeState);
    }
  }

  /**
   *
   * @param {string} hostname
   */
  callNotifiedInjetClient(hostname) {
    if (typeof this.notifyInjet === 'function') {
      this.notifyInjet(hostname);
    }
  }

  async locked() {
    this.memStore.putState({ Plain: null, items: [] });
  }

  async unlock(SubPriKey) {
    let Cypher64, Plain;
    try {
      Cypher64 = (await this.store.getState()).Cypher64;
      logger.debug('WebsiteController:unlock>>>>>>>>>>>>>>>>>>>>>>>>>>', Cypher64, typeof Cypher64);
      if (!Cypher64) {
        const f = InitFile(SubPriKey);
        Plain = f.Plain;
        Cypher64 = f.Cypher64;
        this.store.updateState({ Cypher64 });
      } else {
        Plain = decryptToPlainTxt(SubPriKey, Cypher64);
      }
      const items = transferTerms(Plain, true);

      if (Plain.unwrap) {
        Plain = Plain.unwrap();
      }
      //update memStore
      this.memStore.updateState({ Plain, items, SubPriKey });
    } catch (error) {
      console.warn('decrypted Website Cypher64 to Plain failed.', error);
      throw 'decrypted Website Cypher64 to Plain failed.';
    }
  }

  async addItem(subKey, data = {}) {
    if (!subKey) throw new Error('lost subPriKey.');
    if (!data) throw new Error('lost item data.');

    logger.warn('add website item failed', data);
    const cypher64 = await this.getCypher64();
    if (!cypher64) throw new Error('local cypher lost.');

    const { title, username, password, hostname } = data;

    try {
      const f = UpdateCmdAdd(subKey, cypher64, new Term(title, username, password));
      const { Plain, Cypher64 } = f;
      this.store.updateState({ Cypher64 });
      this.reloadMemStore(Plain, Cypher64);
      this.emit('notify:injet:client', hostname);
      return await this.getState();
    } catch (error) {
      logger.warn('add website item failed', error);
      throw new BPError(`Title:${title} has been exist.`, VEX_ITEM_EXIST);
    }
  }

  async updateItem(subKey, data) {
    if (!subKey) throw new Error('lost subPriKey.');
    if (!data) throw new Error('lost item data.');

    const cypher64 = await this.getCypher64();
    if (!cypher64) throw new Error('local cypher lost.');

    const { title, username, password, hostname } = data;
    try {
      const f = UpdateCmdChange(subKey, cypher64, new Term(title, username, password));
      const { Plain, Cypher64 } = f;
      await this.store.updateState({ Cypher64 });
      await this.reloadMemStore(Plain, Cypher64);

      if (hostname) this.emit('notify:injet:client', hostname);
      return await this.getState();
    } catch (err) {
      throw new BPError(`Title ${title} unfound.`, VEX_ITEM_EDIT);
    }
  }

  async deleteItem(subKey, data) {
    if (!subKey) throw new Error('lost subPriKey.');
    if (!data || !data.title) throw new Error('lost item data.');

    const { title, hostname } = data;
    const cypher64 = await this.getCypher64();
    if (!cypher64) throw new Error('local cypher lost.');

    try {
      const f = UpdateCmdDelete(subKey, cypher64, new Term(title, null, null));

      const { Plain, Cypher64 } = f;
      await this.store.updateState({ Cypher64 });
      await this.reloadMemStore(Plain, Cypher64);
      this.emit('notify:injet:client', hostname);
      return await this.getState();
    } catch (err) {
      logger.warn(err);
      throw new BPError(`Title ${title} unfound.`, VEX_ITEM_DELETE);
    }
  }

  async reloadMemStore(Plain, cypher64) {
    if (!Plain || !cypher64) {
      return;
    }
    try {
      const items = transferTerms(Plain, true);
      if (typeof Plain.unwrap === 'function') {
        Plain = Plain.unwrap();
      }
      await this.memStore.updateState({ Plain, items });
    } catch (err) {}
  }

  async getState() {
    const state = await this.memStore.getState();
    const diff = getDiff(state.Plain);

    return {
      ...state,
      diff,
    };
  }

  async getCypher64() {
    const state = await this.store.getState();
    return state.Cypher64 || '';
  }

  /** notice : this state only send to injet feild-controller */
  async getZombieState(hostname) {
    const state = await this.memStore.getState();
    let items = state.items || [];
    let matchedNum = 0;

    if (hostname && items.length > 0) {
      // let subHostname = hostname.split('.').lenght > 2 ? hostname.split('.').slice(-2).join('.') : hostname
      // items = items.filter((it) => (it.hostname.endsWith(subHostname)) || hostname.endsWith(it.hostname));
      items = items.filter(
        (it) => it.hostname.endsWith(hostname) || hostname.endsWith(it.hostname)
      );
      matchedNum = items.length;
    } else {
      items = [];
    }

    //make password safety don't send to page dom ,it only in leech can get password
    // items = items.map((it) => {
    //   it.password = 'bp-hidden';
    //   return it;
    // });

    const newItems = deepthCopyItems(items).map((it) => {
      // it.password = 'bp-hidden';
      return it;
    });
    // logger.debug('>>bp-hidden>>>>>>>>>>>>>>>>>>>>>>>>',items,newItems)

    return {
      matchedNum,
      hostname,
      items: newItems,
    };
  }
}

function deepthCopyItems(items) {
  if (!items || !items.length) return [];
  return JSON.parse(JSON.stringify(items));
}

export default WebsiteController;
