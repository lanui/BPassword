import _ from 'lodash';
import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import ComposedStore from 'obs-store/lib/composed';
import RemoveableObserverStore from '../observestore/removeable-obs-store';

import logger from '@/libs/logger';
import { transferTerms, getDiff } from '../utils/item-transfer';
import BizError from '../biz-error';
import {
  VEX_ITEM_EXIST,
  VEX_ITEM_EDIT,
  VEX_ITEM_DELETE,
  INTERNAL_ERROR,
} from '../biz-error/error-codes';
import { API_RT_FIELDS_VALT_CHANGED, API_RT_FIELDS_MATCHED_STATE } from '@/libs/msgapi/api-types';

import {
  getWebStorageEventInst,
  fetchEventLogsFromChain,
} from '../web3/apis/web-storage-event-api';
import { getWeb3Inst } from '../web3/web3-helpers';
import { SUB_ENTRY_FILE } from '../messages/fox/extension-info';
import We3 from 'web3';

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
    const { chainState = {}, versionState = {} } = initState;

    this.getCurrentProvider = opts.getCurrentProvider;
    this.getCurrentWalletState = opts.getCurrentWalletState;

    this.notifyInjet = opts.notifyInjet;
    this.getActivedMuxStream = opts.getActivedMuxStream;
    this.getActivedTopMuxStream = opts.getActivedTopMuxStream;

    // this.store = new ObservableStore(Object.assign({}, StateStruct, initState));

    /**
     * locale State
     * chainId:Cypher64
     */
    this.chainStore = new ObservableStore(chainState);
    /**
     * block chain state
     * lastTxHash: {chainId,lastTxHash ,blockNumber}
     * when sync from block update this state
     * this state will sync block chain
     */
    this.versionStore = new ObservableStore(versionState);

    this.store = new ComposedStore({
      chainState: this.chainStore,
      versionState: this.versionStore,
    });

    /**
     *
     */
    this.memStore = new ObservableStore();
    /**
     * 存储本地差异与chain
     */
    this.memDiffStore = new ObservableStore({});

    /**
     * tabId : {hostname,username,password}
     */
    this.activeValtStore = new RemoveableObserverStore();
    this.activeValtStore.subscribe(this.notifyLeechPageValtStateListener.bind(this));

    //item changed notify same host tabs
    this.on('notify:injet:client', _.debounce(this.callNotifiedInjetClient.bind(this), 500));
  }

  /*
   *
   * @param {*} tabId
   * @param {*} valtState
   */
  updateActieTabValtState(tabId, valtState) {
    logger.debug('Website :updateActieTabValtState>>>>>>>>', tabId, valtState);
    if (tabId !== undefined && valtState) {
      valtState.ctype = 'inputChanged';
      const activeState = {
        [tabId]: valtState,
      };
      this.activeValtStore.updateState(activeState);
    }
  }

  removeTabValtState(tabId) {
    if (tabId) {
      this.activeValtStore.removeKeyState(tabId);
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
    let { chainId } = (await this.getCurrentProvider()) || {};

    if (!chainId) {
      throw new BizError('lost chainId & provider', INTERNAL_ERROR);
    }

    let Cypher64, Plain;
    try {
      Cypher64 = await this.getCypher64();
      // logger.debug('WebsiteController:unlock>>>>>>>>>>>>>>>>>>>>>>>>>>', Cypher64, typeof Cypher64, SubPriKey);
      if (!Cypher64) {
        const f = InitFile(SubPriKey);
        Plain = f.Plain;
        Cypher64 = f.Cypher64;

        _initChainState.call(this, chainId, Cypher64);
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

      this.updateLocalChainCypher64(Cypher64);
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
    logger.debug('>>>>>>>>>>>>>', data, cypher64);
    try {
      const f = UpdateCmdChange(subKey, cypher64, new Term(title, username, password));
      const { Plain, Cypher64 } = f;

      this.updateLocalChainCypher64(Cypher64);
      await this.reloadMemStore(Plain, Cypher64);

      if (hostname) this.emit('notify:injet:client', hostname);
      return await this.getState();
    } catch (err) {
      logger.debug('>>>>', err);
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
      this.updateLocalChainCypher64(Cypher64);
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
    const { chainId } = await this.getCurrentProvider();

    const lastChainState = this.getlatestBlockState(chainId);

    return {
      ...state,
      lastChainState,
    };
  }

  /**
   * get Locale chainStore State
   */
  async getCypher64() {
    const { chainId } = this.getCurrentProvider();
    const chainState = (await this.chainStore.getState()) || {};
    const cypher64 = chainState[chainId] && chainState[chainId] ? chainState[chainId] : '';
    return cypher64;
  }

  updateLocalChainCypher64(Cypher64) {
    const { chainId } = this.getCurrentProvider();
    if (!chainId) {
      throw new BizError('lost chainId in currentProvider.', INTERNAL_ERROR);
    }
    this.chainStore.updateState({ [chainId]: Cypher64 });
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

  /**
   *
   */
  async networkChanged() {
    const { chainId, rpcUrl } = this.getCurrentProvider();

    const { selectedAddress, isUnlocked, dev3 } = (await this.getCurrentWalletState()) || {};
    if (chainId) {
      throw new BizError(
        'Websiete changed network fail. may be lost chainId or rpcUrl',
        INTERNAL_ERROR
      );
    }

    if (!isUnlocked || !dev3) {
      logger.warn('account locked or no account will not update website state');
      return;
    }

    let Plain,
      Cypher64 = await this.getCypher64();
    if (!Cypher64) {
      const f = InitFile(dev3.SubPriKey);
      Plain = f.Plain;
      Cypher64 = f.Cypher64;

      _initChainState.call(this, chainId, Cypher64);
    } else {
      Plain = decryptToPlainTxt(dev3.SubPriKey, Cypher64);
    }

    Plain.unwrap && (Plain = Plain.unwrap());
    this.reloadMemStore(Plain, Cypher64);
  }

  /**
   *
   */
  async updateVersionState(chainId, blockNumber = 0, lastTxHash = '') {
    if (!chainId) {
      throw new BizError('lost chainId.', INTERNAL_ERROR);
    }
    const upState = {
      [chainId]: {
        uts: new Date().getTime(),
        blockNumber,
        lastTxHash,
      },
    };

    this.versionStore.updateState(upState);
  }

  /**
   *
   * @param {*} chainId
   */
  getlatestBlockState(chainId) {
    if (!chainId) {
      throw new BizError('lost chainId.', INTERNAL_ERROR);
    }

    const verState = this.versionStore.getState() || {};
    const { blockNumber = 0, lastTxHash = '' } = verState[chainId] || {};
    return { blockNumber, lastTxHash };
  }

  /**
   *
   * @param {object} blockLogs
   * @property {number} blockNumber
   * @property {string} lastTxHash
   * @property {array} logs [data bytes]
   *
   */
  updateSyncBlockLogs(blockLogs) {}

  async reinitializeCypher(force = false) {
    const { chainId } = this.getCurrentProvider();
    const { dev3 } = this.getCurrentWalletState();
    if (!chainId || !dev3) {
      throw new BizError('Account logout or no account.', WALLET_LOCKED);
    }

    const wholeChainState = this.chainStore.getState() || {};
    let Cypher64 = wholeChainState[chainId];

    let Plain;
    if (force) {
      const f = InitFile(dev3.SubPriKey);
      Plain = f.Plain;
      Cypher64 = f.Cypher64;
      logger.warn('Website locale passbook reset empty.');
      this.chainStore.updateState({ [chainId]: Cypher64 });
    }
    if (!Cypher64) {
      const f = InitFile(dev3.SubPriKey);
      Plain = f.Plain;
      Cypher64 = f.Cypher64;
      this.chainStore.updateState({ [chainId]: Cypher64 });
    }

    if (!Plain) {
      Plain = decryptToPlainTxt(dev3.SubPriKey, Cypher64);
    }
    await this.reloadMemStore(Plain, Cypher64);

    return this.getState();
  }

  /* <----------------------- Block Chain methods ----------------------> */
  /**
   *
   */
  async mergeLocalFromChainCypher(fromBlock) {
    const { isUnlocked, selectedAddress, dev3 } = this.getCurrentWalletState();
    fromBlock = !fromBlock ? this.getFromBlockNumber() : fromBlock;

    const currCypher64 = await this.getCypher64();
    if (!currCypher64) {
      throw new BizError('Local Cypher Illegal.', INTERNAL_ERROR);
    }

    const logsResp = await _GetFromChainLogs.call(this, selectedAddress, fromBlock);

    const { blockNumber, lastTxHash, logs = [], evtLogs } = logsResp;
    logger.debug('Chain data>>>>>>>', fromBlock, blockNumber, lastTxHash, logs.length);

    let retFile = null;
    if (logs.length > 0 && blockNumber > fromBlock) {
      retFile = UpdateBlockData(dev3.SubPriKey, currCypher64, blockNumber, lastTxHash, logs);
      logger.debug('>>>>>>>', retFile);
      this.reloadMemStore(retFile.Plain, retFile.Cypher64);
      this.updateLocalChainCypher64(retFile.Cypher64);
    }

    return await this.memStore.getState();
  }

  async getLatestLogs(fromBlock) {
    const { selectedAddress } = this.getCurrentWalletState();
    fromBlock = !fromBlock ? this.getFromBlockNumber() : fromBlock;

    const currCypher64 = await this.getCypher64();
    if (!currCypher64) {
      throw new BizError('Local Cypher Illegal.', INTERNAL_ERROR);
    }

    const logsResp = await _GetFromChainLogs.call(this, selectedAddress, fromBlock);

    return logsResp;
  }

  /**
   * make sure sync update memStore
   * get last sync BlockNumber
   */
  getFromBlockNumber() {
    const memState = this.memStore.getState() || {};
    const { Plain = {} } = memState;
    return Plain.BlockNumber || 0;
  }

  async getCypherBytesHex() {
    const curCypher64 = await this.getCypher64();
    const { dev3 } = await this.getCurrentWalletState();
    if (!dev3) {
      throw new BizError('no wallet or account locked.', INTERNAL_ERROR);
    }
    if (!curCypher64) {
      throw new BizError('cypher illegal.', INTERNAL_ERROR);
    }
    const cypherHex = Web3.utils.bytesToHex(ExtractCommit(dev3.SubPriKey, curCypher64));
    return cypherHex;
  }
}

function deepthCopyItems(items) {
  if (!items || !items.length) return [];
  return JSON.parse(JSON.stringify(items));
}

/**
 *
 * @param {object} blockData
 * @property {number} blockNumber
 * @property {string}
 * @property {} Plain
 */
async function _updateSyncBlockData(blockData) {}

async function _getLocalChainState(chainId) {
  const _state = this.store.getState();
  chaiId = chainId || _state.chainId;
}

/**
 *
 * @param {number} chainId
 * @param {object} Cypher64
 */
function _initChainState(chainId, Cypher64) {
  let upChainState = {
    [chainId]: Cypher64,
  };

  this.chainStore.updateState(upChainState);
}

/**
 *
 * @param {number} fromBlock
 */
async function _GetFromChainLogs(selectedAddress, fromBlock = 0) {
  const { chainId, rpcUrl } = this.getCurrentProvider();

  if (!chainId || !rpcUrl || !selectedAddress) {
    throw new BizError('Params illegal', INTERNAL_ERROR);
  }

  logger.debug('Website _GetFromChainLogs>>>>>>>>>>>>', fromBlock);
  const web3js = getWeb3Inst(rpcUrl);
  const respLogs = await fetchEventLogsFromChain(web3js, chainId, selectedAddress, fromBlock);
  return respLogs;
}

export default WebsiteController;
