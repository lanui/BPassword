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

import {
  getMobStorageEventInst,
  fetchEventLogsFromChain,
} from '../web3/apis/mob-storage-event-api';

import { getWeb3Inst } from '../web3/web3-helpers';

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

    const { localState = {}, versionState = {} } = initState;
    /**
     * locale State
     * chainId:Cypher64
     */
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

  getFromBlockNumber() {
    const { Plain } = this.memStore.getState();
    return Plain && Plain.BlockNumber ? Plain.BlockNumber : 0;
  }

  /** -------------------- Block Chain ------------------------ */
  async mergeLocalFromChainCypher(fromBlock) {
    const { selectedAddress, dev3 } = this.currentWalletState();
    fromBlock = !fromBlock ? this.getFromBlockNumber() : fromBlock;

    const currCypher64 = await this.getCypher64();
    if (!currCypher64) {
      throw new BizError('Local Cypher Illegal.', INTERNAL_ERROR);
    }
    const logsResp = await _GetFromChainLogs.call(this, selectedAddress, fromBlock);

    const { blockNumber, lastTxHash, logs = [] } = logsResp;
    logger.debug('Chain data>>>>>>>', fromBlock, blockNumber, lastTxHash, logs.length);
    let retFile = null;
    if (logs.length > 0 && blockNumber > fromBlock) {
      retFile = UpdateBlockData(dev3.SubPriKey, currCypher64, blockNumber, lastTxHash, logs);
      logger.debug('Mobile mergeLocalFromChainCypher>>>>>>>', retFile);
      this.reloadMemStore(retFile.Plain, retFile.Cypher64);
      this.updateLocalChainCypher64(retFile.Cypher64);
    }

    return await this.memStore.getState();
  }

  async getLatestLogs(fromBlock) {
    const { selectedAddress } = this.currentWalletState();
    fromBlock = !fromBlock ? this.getFromBlockNumber() : fromBlock;

    const currCypher64 = await this.getCypher64();
    if (!currCypher64) {
      throw new BizError('Local Cypher Illegal.', INTERNAL_ERROR);
    }

    const logsResp = await _GetFromChainLogs.call(this, selectedAddress, fromBlock);

    return logsResp;
  }
}

/**
 *
 * @param {number} fromBlock
 */
async function _GetFromChainLogs(selectedAddress, fromBlock = 0) {
  const { chainId, rpcUrl } = this.currentProvider();

  if (!chainId || !rpcUrl || !selectedAddress) {
    throw new BizError('Params illegal', INTERNAL_ERROR);
  }

  logger.debug('_GetFromChainLogs>>>>>>>>>>>>', fromBlock);
  const web3js = getWeb3Inst(rpcUrl);
  const respLogs = await fetchEventLogsFromChain(web3js, chainId, selectedAddress, fromBlock);
  logger.debug('Mobile _GetFromChainLogs>>>>>>>>>>>>', respLogs);
  return respLogs;
}

export default MobileController;
