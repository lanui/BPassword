import EventEmitter from 'events';
import ObservableStore from 'obs-store';

import { ROPSTEN, NETWORK_TYPE_NAME_KV } from '../network/enums';

import { SmartAddressesTranslate } from './contracts/index';

import logger from '../logger';
import BizError from '../biz-error';
import {
  PROVIDER_ILLEGAL,
  NETWORK_UNAVAILABLE,
  ACCOUNT_NOT_EXISTS,
} from '../biz-error/error-codes';

import { getWeb3Inst } from './web3-helpers';
import APIManager from './apis';

import { BT_TOKEN, ETH_TOKEN } from './contracts/enums';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-09
 *    @comments:
 **********************************************************************/
const StateStruct = {
  tokens: {}, // address:{symbol,chainId,lasttime,balance}
};
class Web3Controller extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.getCurrentProvider = opts.getCurrentProvider;
    this.currentAccState = opts.currentAccState;
    const initState = opts.initState || _initStateStruct();

    this.reloadTokenBalances = _reloadBalances.bind(this);

    this.store = new ObservableStore(initState);

    this.on('reloadBalances', this.reloadBalances.bind(this));
  }

  async reloadBalances() {
    const _provider = await this.getCurrentProvider();
    if (!_provider || !_provider.rpcUrl) {
      logger.warn('Current Provdier Unset or RPCUrl illegal.', _provider?.rpcUrl);
      throw new BizError('Provider Unset or illegal rpcUrl.', PROVIDER_ILLEGAL);
    }

    return this.reloadTokenBalances(_provider);
    // const state = this.store.getState() || {};
    // let { balances = {} } = state;
    // const accState = await this.currentAccState();
    // if (!accState || !accState.isUnlocked) {
    //   logger.warn('get current account state fail', accState);
    //   throw new BizError('account not exists or logout', ACCOUNT_NOT_EXISTS);
    // }

    // try {
    //   const { type, rpcUrl, chainId } = _provider;
    //   // dev3:MainPriKey,SubPriKey [uint8Array]
    //   const { selectedAddress, dev3 } = accState;
    //   let web3js = getWeb3Inst(rpcUrl);
    //   logger.debug('Web3Controller:reloadBalances>>>>', selectedAddress);

    //   let ethBalance = await web3js.eth.getBalance(selectedAddress);
    //   let btBalance = await APIManager.BTApi.getBalance(web3js, selectedAddress, chainId);

    //   let chainBalance = {
    //     [ETH_TOKEN]: ethBalance,
    //     [BT_TOKEN]: btBalance,
    //   };

    //   balances[chainId] = chainBalance;

    //   this.store.updateState(balances);
    //   logger.debug('Web3Controller:reloadBalances>>>>', balances);

    //   return this.getSendState(chainId);
    // } catch (err) {
    //   logger.warn('Web3 disconnect.', err);
    //   throw new BizError(`Provider ${_provider.rpcUrl} disconnected.`, NETWORK_UNAVAILABLE);
    // }
  }

  async getBalanceState() {
    const { chainId } = await this.getCurrentProvider();
    const { balances = {} } = this.store.getState();

    if (!chainId) {
      throw new BizError('provider chainId unfound', PROVIDER_ILLEGAL);
    }

    if (!balances || !balances[chainId]) {
      return {
        [ETH_TOKEN]: '0',
        [BT_TOKEN]: '0',
      };
    }
    return balances[chainId];
  }

  getSendState(chainId) {
    const { balances = {}, ts = 0, txs } = this.store.getState();
    let chainBalances = {},
      chainTxs = [];
    if (chainId && typeof balances[chainId] === 'object') {
      chainBalances = balances[chainId];
    }
    if (chainId && txs && txs[chainId] && Array.isArray(txs[chainId])) {
      chainTxs = txs[chainId];
    }
    let sendState = {
      ts,
      chainId,
      chainBalances,
      chainTxs,
    };

    return sendState;
  }
}

/**
 *
 */
function _initStateStruct() {
  const initState = {
    balances: {},
    tokens: {},
    txs: {},
    smarts: {},
    ts: new Date().getTime(),
    historys: {},
  };

  let smarts = {
    1: [],
    3: [],
  };

  if (SmartAddressesTranslate()) {
    smarts = SmartAddressesTranslate();
  }

  initState.smarts = smarts;

  return initState;
}

async function _reloadBalances(provider) {
  if (!provider || !provider.rpcUrl) {
    logger.warn('Current Provdier Unset or RPCUrl illegal.', provider?.rpcUrl);
    throw new BizError('Provider Unset or illegal rpcUrl.', PROVIDER_ILLEGAL);
  }
  const state = this.store.getState() || {};
  let { balances = {} } = state;
  const accState = await this.currentAccState();
  if (!accState || !accState.isUnlocked) {
    logger.warn('get current account state fail', accState);
    throw new BizError('account not exists or logout', ACCOUNT_NOT_EXISTS);
  }

  try {
    const { type, rpcUrl, chainId } = provider;
    // dev3:MainPriKey,SubPriKey [uint8Array]
    const { selectedAddress, dev3 } = accState;
    let web3js = getWeb3Inst(rpcUrl);
    logger.debug('Web3Controller:reloadBalances>>>>', selectedAddress);

    let ethBalance = await web3js.eth.getBalance(selectedAddress);
    let btBalance = await APIManager.BTApi.getBalance(web3js, selectedAddress, chainId);

    let chainBalance = {
      [ETH_TOKEN]: ethBalance,
      [BT_TOKEN]: btBalance,
    };

    balances[chainId] = chainBalance;

    this.store.updateState(balances);
    logger.debug('Web3Controller:reloadBalances>>>>', balances);

    return this.getSendState(chainId);
  } catch (err) {
    logger.warn('Web3 disconnect.', err);
    throw new BizError(`Provider ${provider.rpcUrl} disconnected.`, NETWORK_UNAVAILABLE);
  }
}

export default Web3Controller;
