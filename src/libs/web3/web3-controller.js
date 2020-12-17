import { debounce } from 'lodash';
import axios from 'axios';
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
  INTERNAL_ERROR,
} from '../biz-error/error-codes';

import { getWeb3Inst, getChainConfig } from './web3-helpers';
import APIManager from './apis';

import { BT_TOKEN, ETH_TOKEN, BT_APPRPOVE_ESGAS } from './contracts/enums';
import {
  DEFAULT_GAS_LIMIT,
  TX_PENDING,
  TX_FAILED,
  TX_CONFIRMED,
  DEFAULT_GAS_STATION_URL,
  DEFAULT_GAS_PRICE,
} from './cnst';

import { getBalance, getBTContractInst } from './apis/bt-api';
import { getBptMemberAddress } from './apis/bpt-member-api';
import { signedDataTransaction, signedRawTxData4Method } from './send-rawtx';
import Web3 from 'web3';

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

    this.walletState = opts.walletState;
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

    // config not depend chainId
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

    this.on('web3:reload:gasStation', _gasStation.bind(this));
    this.on(
      'update:config:estimateGas',
      debounce(this.updateEstimateGasConfig.bind(this), 2 * 60 * 1000)
    );
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
    if (chainId && txs && typeof txs === 'object' && Object.values(txs).length > 0) {
      chainTxs = Object.values(txs).filter((tx) => tx.chainId === chainId);
    }

    if (chainId && status[chainId]) {
      chainStatus = status[chainId];
    }

    const configState = this.configStore.getState();
    let gasState = _translateGasStation(configState, chainId);

    let sendState = {
      gasState,
      chainStatus,
      chainId,
      ts,
      chainBalances,
      chainTxs,
    };

    return sendState;
  }

  getChainTxs(chainId) {
    const txs = this.txStore.getState();
    let chainTxs = [];
    if (chainId && txs && typeof txs === 'object' && Object.values(txs).length > 0) {
      chainTxs = Object.values(txs).filter((tx) => tx.chainId === chainId);
    }

    return chainTxs;
  }

  /**
   *
   * @param {string} chainId chainId
   * @param {*} txObj
   * @param {string} statusText
   */
  updateChainTx(chainId, txObj, statusText) {
    if (typeof txObj !== 'object' || !txObj.txHash || !chainId) {
      throw new BizError('Tx Object data or chainId illegal.', INTERNAL_ERROR);
    }
    statusText = statusText || TX_PENDING;
    const uid = `${chainId}_${txObj.txHash}`;
    const txState = {
      [uid]: {
        ...txObj,
        chainId,
        statusText,
      },
    };

    this.txStore.updateState(txState);
  }

  /**
   *
   * @param {string} uid [chainId_txHash]
   * @param {string} statusText
   * @param {object} info
   */
  updateTxStatus(uid, statusText, info = {}) {
    const state = this.txStore.getState() || {};
    const old = state[uid];
    if (old) {
      let newState = {
        ...old,
        statusText,
        ...info,
      };

      this.txStore.updateState({ [uid]: newState });
      //TODO
    }
  }

  async approveToMembership(gasPriceSwei = 0) {
    await _approveToMember.call(this, gasPriceSwei);
  }

  /**
   * methods key->number
   * @param {object} gasUsedState
   */
  updateEstimateGasConfig(gasUsedState) {
    if (typeof gasUsedState === 'object') {
      this.configStore.updateState(gasUsedState);
    }
  }

  getPendingTxs(chainId) {
    const txsState = this.txStore.getState();
    let pendingTxs = [];
    if (txsState && Object.values(txsState).length > 0) {
      pendingTxs = Object.values(txsState).filter(
        (tx) => tx.chainId === chainId && tx.statusText === TX_PENDING
      );
    }

    return pendingTxs;
  }

  /** --------------------------------- Signed Methods ------------------------------------ */
  async signedBTApproved4Member(reqData) {
    logger.debug('signedBTApproved4Member>>>>>>>>>>>>>>>>', reqData);
    const { reqId, gasPriceSwei = 0 } = reqData;
    if (!reqId) {
      throw new BizError('Miss parameter txReqId', PARAMS_ILLEGAL);
    }

    return await _signedApproved4Member.call(this, reqId, gasPriceSwei);
  }

  /**
   * @DateTime 2020-12-17
   * @param    {[object]}   txState [reqId,chainId,txHash] required [uid,statusText] optional
   * @return   {[array]}           [chainTxs]
   */
  async chainTxStatusUpdateForUI(txState) {
    const txs = this.txStore.getState();
    const { chainId, txHash, reqId } = txState || {};
    if (!reqId || !chainId || !txHash) {
      throw new BizError('TxState must contains reqId,chainId and txHash');
    }

    let uid = `${chainId}_${txHash}`;
    const oldState = txs[uid] || {};

    const newState = {
      [uid]: {
        ...oldState,
        ...txState,
      },
    };

    this.txStore.updateState(newState);

    return this.getChainTxs(chainId);
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

async function _rechargeMembership(custGasLimit = 0) {
  const walletState = await this.walletState();
  if (
    !walletState ||
    !walletState.isUnlocked ||
    !walletState.dev3 ||
    !walletState.selectedAddress
  ) {
    throw new BizError('Extension logout or no account.', ACCOUNT_NOT_EXISTS);
  }

  const selectedAddress = walletState.selectedAddress;

  const _provider = await this.getCurrentProvider();
  if (!_provider || !_provider.rpcUrl) {
    logger.debug('no provider so unhanlder set initialized.');
    return;
  }
  const { chainId, rpcUrl } = _provider;
}

async function _signedApproved4Member(reqId, gasPriceSwei) {
  const toWei = Web3.utils.toWei;
  const walletState = await this.walletState();
  if (
    !walletState ||
    !walletState.isUnlocked ||
    !walletState.dev3 ||
    !walletState.selectedAddress
  ) {
    throw new BizError('Extension logout or no account.', ACCOUNT_NOT_EXISTS);
  }

  const _provider = await this.getCurrentProvider();
  if (!_provider || !_provider.rpcUrl) {
    logger.debug('no provider so unhanlder set initialized.');
    return;
  }

  /** Inst init defined */
  const selectedAddress = walletState.selectedAddress;
  const { chainId, rpcUrl } = _provider;

  const { config = {} } = this.store.getState();
  const { chainStatus = {} } = this.getSendState(chainId);

  const web3js = getWeb3Inst(rpcUrl);
  const tokenInst = getBTContractInst(web3js, chainId, selectedAddress);
  const tokenAddress = tokenInst._address;

  const btsBalance = await tokenInst.methods.balanceOf(selectedAddress).call();

  //TODO valid insuffient
  let memberCostWeiPerYear = chainStatus.memberCostWeiPerYear || toWei('98', 'ether');

  //TODO txs valid pending

  let { chain, gasPrice, gasStation = {} } = config;

  const approveAddress = getBptMemberAddress(chainId);

  const dataABI = tokenInst.methods.approve(approveAddress, btsBalance).encodeABI();

  let lastApproveGas = config[BT_APPRPOVE_ESGAS];
  if (!lastApproveGas || lastApproveGas) {
    lastApproveGas = await tokenInst.methods
      .approve(approveAddress, btsBalance)
      .estimateGas({ from: selectedAddress });
  }

  let gasLimit = parseInt(parseFloat(lastApproveGas) * 1.1);

  logger.debug('approveAddress:>>>BTs>', btsBalance, lastApproveGas);

  let avg = gasStation.average;
  if (gasPriceSwei && gasPriceSwei !== '0') {
    gasPrice = toWei((gasPriceSwei / 10).toString(), 'Gwei');
  } else if (avg && avg != '0') {
    gasPrice = toWei((avg / 10).toString(), 'Gwei');
  }

  /** 组织参数 */

  const dev3 = walletState.dev3;

  const txParams = {
    gasLimit,
    gasPrice,
    value: 0,
    to: tokenAddress,
  };

  logger.debug('approveAddress:>>>BTs>', txParams);

  const txRawDataSerialize = await signedRawTxData4Method(web3js, dev3, txParams, dataABI, {
    chainId,
    chain,
    selectedAddress,
  });

  logger.debug('Web3 signed data hex string:', txRawDataSerialize);

  return {
    reqId,
    chainId,
    rawData: txRawDataSerialize,
  };
}

/**
 * gasPriceSwei = gwei/10
 * @param {string|Number} gasPriceSwei
 * @param {number} custGasLimit
 */
async function _approveToMember(reqId, gasPriceSwei) {
  const toWei = Web3.utils.toWei;
  const walletState = await this.walletState();
  if (
    !walletState ||
    !walletState.isUnlocked ||
    !walletState.dev3 ||
    !walletState.selectedAddress
  ) {
    throw new BizError('Extension logout or no account.', ACCOUNT_NOT_EXISTS);
  }

  const _provider = await this.getCurrentProvider();
  if (!_provider || !_provider.rpcUrl) {
    logger.debug('no provider so unhanlder set initialized.');
    return;
  }

  /** Inst init defined */
  const selectedAddress = walletState.selectedAddress;
  const { chainId, rpcUrl } = _provider;

  const { config = {} } = this.store.getState();
  const { chainStatus = {} } = this.getSendState(chainId);

  const web3js = getWeb3Inst(rpcUrl);
  const tokenInst = getBTContractInst(web3js, chainId, selectedAddress);
  const tokenAddress = tokenInst._address;

  const btsBalance = await tokenInst.methods.balanceOf(selectedAddress).call();

  //TODO valid insuffient
  let memberCostWeiPerYear = chainStatus.memberCostWeiPerYear || toWei('98', 'ether');

  //TODO txs valid pending

  let { chain, gasPrice, gasStation = {} } = config;

  const approveAddress = getBptMemberAddress(chainId);

  const dataABI = tokenInst.methods.approve(approveAddress, btsBalance).encodeABI();

  let lastApproveGas = config[BT_APPRPOVE_ESGAS];
  if (!lastApproveGas) {
    lastApproveGas = await tokenInst.methods
      .approve(approveAddress, btsBalance)
      .estimateGas({ from: selectedAddress });
  }

  let gasLimit = parseInt(parseFloat(lastApproveGas) * 1.1);

  logger.debug('approveAddress:>>>BTs>', btsBalance, lastApproveGas);

  let avg = gasStation.average;
  if (gasPriceSwei && gasPriceSwei !== '0') {
    gasPrice = toWei((gasPriceSwei / 10).toString(), 'Gwei');
  } else if (avg && avg != '0') {
    gasPrice = toWei((avg / 10).toString(), 'Gwei');
  }

  /** 组织参数 */

  const dev3 = walletState.dev3;

  const txParams = {
    gasLimit,
    gasPrice,
    value: 0,
    to: tokenAddress,
  };

  logger.debug('approveAddress:>>>BTs>', txParams);

  const txRawDataSerialize = await signedRawTxData4Method(web3js, dev3, txParams, dataABI, {
    chainId,
    chain,
    selectedAddress,
  });

  logger.debug('Web3 signed data hex string:', txRawDataSerialize);

  // return new Promise(async(resolve,reject) => {
  let txState = {
    reqId: '',
    txHash: '',
    chainId,
    statusText: TX_PENDING,
    cts: new Date().getTime(),
  };

  // const txHash = await web3js.eth.sendSignedTransaction(txRawDataSerialize);
  // logger.debug('approve TxHash:', txHash);
  // txState.txHash = txHash;
  // await this.updateChainTx(chainId, txState, TX_PENDING);
  // const web3State = await this.getSendState(chainId);
  // return web3State;

  await web3js.eth
    .sendSignedTransaction(txRawDataSerialize)
    .once('transactionHash', async (txHash) => {
      logger.debug('recharge transactionHash:', txHash);
      txState.txHash = txHash;
      await this.updateChainTx(chainId, txState, TX_PENDING);
      const web3State = await this.getSendState(chainId);
      return web3State;
      // return resolve(txHash)
    })
    .on('error', (err, receipt) => {
      logger.debug('recharge Error:', err, receipt);
      // throw BizError(err.message, INTERNAL_ERROR)

      if (txState.txHash) {
        let uid = `${chainId}_${txState.txHash}`;
        this.updateTxStatus(uid, TX_FAILED, receipt);
      }
      throw new BizError(err.message, INTERNAL_ERROR);
      // return reject(new BizError(err.message,INTERNAL_ERROR))
    })
    .then(async (receipt) => {
      let uid = `${chainId}_${txState.txHash}`;
      if (receipt && receipt.gasUsed) {
        const gasNumState = { [BT_APPRPOVE_ESGAS]: receipt.gasUsed };
        this.emit('update:config:estimateGas', gasNumState);
      }

      this.updateTxStatus(uid, TX_CONFIRMED, receipt);
      logger.debug('recharge receiptor:', receipt, uid);
      const web3State = await this.getSendState(chainId);
      return web3State;
      // return resolve(web3State);
    });

  return txState;
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

  const accState = await this.walletState();
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

    const spenderAddress = getBptMemberAddress(chainId);
    let ethBalance = await web3js.eth.getBalance(selectedAddress);
    let btBalance = await APIManager.BTApi.getBalance(web3js, chainId, selectedAddress);
    const allowance = await APIManager.BTApi.getAllowance(
      web3js,
      chainId,
      selectedAddress,
      spenderAddress
    );

    let balances = {
      [chainId]: {
        [ETH_TOKEN]: ethBalance,
        [BT_TOKEN]: btBalance,
        allowance,
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

async function _gasStation(url) {
  const opts = {
    timeout: 3000,
    withCredentials: true,
  };

  try {
    const resp = await axios.get(DEFAULT_GAS_STATION_URL, opts);
    if (resp && resp.status === 200 && resp.data) {
      let gasStation = resp.data;
      delete gasStation.gasPriceRange;
      logger.debug('Response:>>>>>', gasStation);
      this.configStore.updateState({ gasStation });

      return gasStation;
    } else {
      return false;
    }
  } catch (err) {
    logger.debug('Error>>>>>>', err);
  }
}

function _translateGasStation(configState) {
  const fromWei = Web3.utils.fromWei;
  let defaultGasPrice = DEFAULT_GAS_PRICE;

  if (configState && configState.gasPrice) {
    defaultGasPrice = configState['gasPrice'];
  }
  const { gasLimit = DEFAULT_GAS_LIMIT, gasStation } = configState;

  const averageGwei = fromWei(defaultGasPrice.toString(), 'Gwei');
  const defAvg = parseFloat(averageGwei) * 10;

  let gasState = {
    gasLimit,
    average: defAvg,
    safeLow: defAvg / 2,
    fast: defAvg,
    fastest: defAvg * 2,
    gasPrice: defAvg,
    ...gasStation,
  };

  return gasState;
}

export default Web3Controller;
