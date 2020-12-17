import Web3 from 'web3';

import BizError from '../biz-error';
import { PROVIDER_ILLEGAL, NETWORK_UNAVAILABLE, INTERNAL_ERROR } from '../biz-error/error-codes';
import { TX_CONFIRMED, TX_FAILED, TX_PENDING } from './cnst';

const diamondsRate = 10000;

export function getWeb3Inst(rpcUrl) {
  if (!rpcUrl) throw new BizError('Illegal rpcUrl', PROVIDER_ILLEGAL);
  const web3js = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  return web3js;
}

export function wei2Ether(wei = '0', fixedNum = 4) {
  if (/^[0]*(\.)?[0]*$/.test(wei)) {
    return '0.00';
  }

  fixedNum = fixedNum > 6 || fixedNum < 0 ? 4 : fixedNum;
  let etherValt = Web3.utils.fromWei(wei.toString(), 'ether');
  etherValt = parseFloat(etherValt).toFixed(fixedNum);

  return /^\d*\.[0-9]{2}00$/.test(etherValt) ? etherValt.toFixed(fixedNum - 2) : etherValt;
}

export function wei2Diamonds(wei = '0', fixedNum = 4) {
  if (/^[0]*(\.)?[0]*$/.test(wei)) {
    return '0.00';
  }

  fixedNum = fixedNum > 6 || fixedNum < 0 ? 4 : fixedNum;
  let etherValt = Web3.utils.fromWei(wei.toString(), 'ether');
  etherValt = (parseFloat(etherValt) * diamondsRate).toFixed(fixedNum);

  return /^\d*\.[0-9]{2}00$/.test(etherValt) ? etherValt.toFixed(fixedNum - 2) : etherValt;
}

/**
 * a > b :1 ,0 -1
 * @param {number|string} aWei
 * @param {number|string} bWei
 */
export function compareWei(aWei = '0', bWei = '0') {
  const toBN = Web3.utils.toBN;
  return toBN(aWei).cmp(toBN(bWei));
}

export async function getChainConfig(web3js, address) {
  if (!web3js || !address) {
    throw new BizError('Params illegal.', INTERNAL_ERROR);
  }

  const chain = await web3js.eth.net.getNetworkType();
  const chainId = await web3js.eth.getChainId();
  const gasPrice = await web3js.eth.getGasPrice();

  const config = {
    chainId,
    gasPrice,
    chain: chain,
  };

  return config;
}

/**
 *
 * @param {object} web3js
 * @param {string} txHash
 * @param {number} cts
 * @returns {object} txState||null
 */
export async function getReceiptStatus(web3js, txHash, cts) {
  const diffCTS = 5 * 60 * 1000;
  if (!txHash || !cts) {
    throw new BizError('txHash must string hex and cts must timestamp number.', INTERNAL_ERROR);
  }

  const receipt = await web3js.eth.getTransactionReceipt(txHash);
  const currCts = new Date().getTime();

  if (receipt) {
    let statusText =
      receipt.status === null ? TX_PENDING : !!receipt.status ? TX_CONFIRMED : TX_FAILED;
    return { ...receipt, statusText };
  } else if (receipt === null && currCts - cts > diffCTS) {
    return { statusText: TX_FAILED };
  } else {
    return null;
  }
}
