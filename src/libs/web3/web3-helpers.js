import Web3 from 'web3';
import BizError from '../biz-error';
import { PROVIDER_ILLEGAL, NETWORK_UNAVAILABLE } from '../biz-error/error-codes';

import logger from '../logger';

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
