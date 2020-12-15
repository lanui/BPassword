import { debounce } from 'lodash';
import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import ComposedStore from 'obs-store/lib/composed';

import { SmartAddressesTranslate } from './contracts/index';

import logger from '../logger';
import BizError from '../biz-error';
import {
  PROVIDER_ILLEGAL,
  NETWORK_UNAVAILABLE,
  ACCOUNT_NOT_EXISTS,
} from '../biz-error/error-codes';

import { getWeb3Inst, getChainConfig } from './web3-helpers';
import APIManager from './apis';

import { BT_TOKEN, ETH_TOKEN } from './contracts/enums';
import { DEFAULT_GAS_LIMIT } from './cnst';

/*********************************************************************
 * AircraftClass ::
 *    @description: update store struct
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-09
 *    @comments:
 **********************************************************************/

class Web3Controller extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.getCurrentProvider = opts.getCurrentProvider;
    this.currentAccState = opts.currentAccState;
    const initState = opts.initState || {};
    const {
      config = _initConfigState(),
      smarts = SmartAddressesTranslate(),
      balances = {},
      historys = {},
      txs = {},
      status = {},
    } = initState;

    this.reloadTokenBalances = _reloadBalances.bind(this);

    this.configStore = new ObservableStore(config);
    this.smartStore = new ObservableStore(smarts);
    this.balanceStore = new ObservableStore(balances);
    this.txStore = new ObservableStore(txs);
    this.historyStore = new ObservableStore(historys);
    this.statusStore = new ObservableStore(status);

    this.store = new ComposedStore({
      config: this.configStore,
      smarts: this.smartStore,
      balances: this.balanceStore,
      historys: this.historyStore,
      txs: this.txStore,
      status: this.statusStore,
    });

    this.on('reloadBalances', this.reloadBalances.bind(this));

    this.on('web3:reload:config', debounce(_reloadConfig.bind(this), 1000));
    this.on('web3:reload:member:status', _reloadChainStatus.bind(this));
  }

  async reloadBalances() {
    const _provider = await this.getCurrentProvider();
    if (!_provider || !_provider.rpcUrl) {
      logger.warn('Current Provdier Unset or RPCUrl illegal.', _provider?.rpcUrl);
      throw new BizError('Provider Unset or illegal rpcUrl.', PROVIDER_ILLEGAL);
    }

    return this.reloadTokenBalances(_provider);
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
    const { balances = {}, ts = 0, txs = {}, config = {}, status = {} } = this.store.getState();
    let chainBalances = {},
      chainStatus = {},
      chainTxs = [];
    if (chainId && typeof balances[chainId] === 'object') {
      chainBalances = balances[chainId];
    }
    if (chainId && txs && txs[chainId] && Array.isArray(txs[chainId])) {
      chainTxs = txs[chainId];
    }

    if (chainId && status[chainId]) {
      chainStatus = status[chainId];
    }

    let sendState = {
      chainStatus,
      chainId,
      ts,
      chainBalances,
      chainTxs,
    };

    return sendState;
  }
}

function _initConfigState() {
  return {
    gasLimit: DEFAULT_GAS_LIMIT,
  };
}

/**
 *
 * @param {object} provider
 * @param {string} address hex string
 */
async function _reloadChainStatus(provider, address) {
  try {
    if (!provider || !address) {
      logger.debug('no provider so unhanlder set MemberCostWeiPerYear.');
      throw new BizError('params illegal.', PROVIDER_ILLEGAL);
    }
    const { chainId, rpcUrl } = provider;
    const web3js = getWeb3Inst(rpcUrl);
    const info = await APIManager.BPTMemberApi.getMemberBaseInFo(web3js, chainId, address);
    this.statusStore.updateState(info);
  } catch (err) {
    logger.debug('reload smart status failed.', err.message);
  }
}

async function _reloadConfig(provider, address) {
  try {
    if (!provider || !address) {
      logger.debug('no provider so unhanlder set MemberCostWeiPerYear.');
      return;
    }
    const { rpcUrl, chainId } = provider;
    const web3js = getWeb3Inst(rpcUrl);

    const chainConfig = await getChainConfig(web3js, address);
    logger.debug('_reloadConfig>>>>', chainConfig);

    this.configStore.updateState(chainConfig);
  } catch (err) {
    logger.debug('reload MemberCostWeiPerYear Failed.', err.message);
  }
}

async function _reloadBalances(provider) {
  if (!provider || !provider.rpcUrl) {
    logger.warn('Current Provdier Unset or RPCUrl illegal.', provider?.rpcUrl);
    throw new BizError('Provider Unset or illegal rpcUrl.', PROVIDER_ILLEGAL);
  }

  const accState = await this.currentAccState();
  if (!accState || !accState.isUnlocked) {
    logger.warn('get current account state fail', accState);
    throw new BizError('account not exists or logout', ACCOUNT_NOT_EXISTS);
  }

  try {
    const { type, rpcUrl, chainId } = provider;
    // dev3:MainPriKey,SubPriKey [uint8Array]
    const { selectedAddress } = accState;
    let web3js = getWeb3Inst(rpcUrl);
    // logger.debug('Web3Controller:reloadBalances>>>>', selectedAddress);

    let ethBalance = await web3js.eth.getBalance(selectedAddress);
    let btBalance = await APIManager.BTApi.getBalance(web3js, selectedAddress, chainId);

    let balances = {
      [chainId]: {
        [ETH_TOKEN]: ethBalance,
        [BT_TOKEN]: btBalance,
      },
    };

    this.balanceStore.updateState(balances);

    logger.debug('Web3Controller:reloadBalances>>>>', balances);

    return this.getSendState(chainId);
  } catch (err) {
    logger.warn('Web3 disconnect.', err);
    throw new BizError(`Provider ${provider.rpcUrl} disconnected.`, NETWORK_UNAVAILABLE);
  }
}

export default Web3Controller;
