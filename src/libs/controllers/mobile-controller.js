import EventEmitter from 'events';
import ObservableStore from 'obs-store';

import ComposedStore from 'obs-store/lib/composed';

import logger from '@/libs/logger';
import { transferTerms, getDiff } from '../utils/item-transfer';
import BizError from '../biz-error';
import {
  VEX_ITEM_EXIST,
  VEX_ITEM_EDIT,
  VEX_ITEM_DELETE,
  INTERNAL_ERROR,
} from '../biz-error/error-codes';

/*********************************************************************
 * AircraftClass ::Mobile passbook management
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

class MobileController extends EventEmitter {
  /**
   *
   * @param {object} opts
   *
   */
  constructor(opts = {}) {
    super();

    this.currentProvider = opts.currentProvider;
    this.currentWalletState = opts.currentWalletState;

    const initState = opts.initState || {};

    const { localState = {}, versionState = [] } = initState;
    this.localStore = new ObservableStore(localState);
    this.versionStore = new ObservableStore(versionState);

    this.store = new ComposedStore({
      localState: this.localStore,
      versionState: this.versionStore,
    });

    this.memStore = new ObservableStore();
  }

  async locked() {
    this.memStore.putState({ Plain: null, items: [] });
  }

  async unlock(SubPriKey) {
    let Cypher64, Plain;
    try {
      Cypher64 = await this.getCypher64();
      if (!Cypher64) {
        const f = InitFile(SubPriKey);
        Plain = f.Plain;
        Cypher64 = f.Cypher64;
        this.updateLocalChainCypher64(Cypher64);
      } else {
        Plain = decryptToPlainTxt(SubPriKey, Cypher64);
      }
      if (typeof Plain.unwrap === 'function') {
        Plain = Plain.unwrap();
      }

      const items = transferTerms(Plain);

      //update memStore
      this.memStore.updateState({ Plain, items, SubPriKey });
    } catch (error) {
      console.warn('decrypted Mobile Cypher64 to Plain failed.', error);
      throw 'decrypted Mobile Cypher64 to Plain failed.';
    }
  }

  async addItem(subKey, data = {}) {
    if (!subKey) throw new Error('lost subPriKey.');
    if (!data) throw new Error('lost item data.');

    const cypher64 = await this.getCypher64();
    if (!cypher64) throw new Error('local cypher lost.');

    const { title, username, password } = data;

    try {
      const f = UpdateCmdAdd(subKey, cypher64, new Term(title, username, password));
      const { Plain, Cypher64 } = f;
      this.updateLocalChainCypher64(Cypher64);
      this.reloadMemStore(Plain, Cypher64);

      return await this.getState();
    } catch (error) {
      logger.warn('add website item failed', error);
      throw new BPError(`Title:${title} has been exist.`, VEX_ITEM_EXIST);
    }
  }

  async updateItem(subKey, data = {}) {
    if (!subKey) throw new Error('lost subPriKey.');
    if (!data) throw new Error('lost item data.');

    const cypher64 = await this.getCypher64();
    if (!cypher64) throw new Error('local cypher lost.');

    const { title, username, password } = data;
    try {
      const f = UpdateCmdChange(subKey, cypher64, new Term(title, username, password));
      const { Plain, Cypher64 } = f;
      this.updateLocalChainCypher64(Cypher64);
      await this.reloadMemStore(Plain, Cypher64);

      return await this.getState();
    } catch (err) {
      logger.error(err);
      throw new BPError(`Title ${title} unfound.`, VEX_ITEM_EDIT);
    }
  }

  async deleteItem(subKey, data = {}) {
    if (!subKey) throw new Error('lost subPriKey.');
    if (!data || !data.title) throw new Error('lost item data.');

    const { title } = data;
    const cypher64 = await this.getCypher64();
    if (!cypher64) throw new Error('local cypher lost.');

    try {
      const f = UpdateCmdDelete(subKey, cypher64, new Term(title, null, null));

      const { Plain, Cypher64 } = f;
      this.updateLocalChainCypher64(Cypher64);
      await this.reloadMemStore(Plain, Cypher64);

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
      if (typeof Plain.unwrap === 'function') {
        Plain = Plain.unwrap();
      }
      const items = transferTerms(Plain, true);
      await this.memStore.updateState({ Plain, items });
    } catch (err) {}
  }

  async getCypher64() {
    const { chainId } = this.currentProvider();
    const localState = this.localStore.getState() || {};
    return localState && localState[chainId] ? localState[chainId] : '';
  }

  async updateLocalChainCypher64(Cypher64) {
    const { chainId } = this.currentProvider();
    if (!chainId) {
      throw new BizError('lost chainId in provider', INTERNAL_ERROR);
    }

    this.localStore.updateState({ [chainId]: Cypher64 });
  }

  async getState() {
    const state = await this.memStore.getState();
    const diff = getDiff(state.Plain);

    return {
      ...state,
      diff,
    };
  }
}

export default MobileController;
