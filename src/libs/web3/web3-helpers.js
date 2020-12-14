import Web3 from 'web3';
import BizError from '../biz-error';
import { PROVIDER_ILLEGAL, NETWORK_UNAVAILABLE } from '../biz-error/error-codes';

import logger from '../logger';

export function getWeb3Inst(rpcUrl) {
  if (!rpcUrl) throw new BizError('Illegal rpcUrl', PROVIDER_ILLEGAL);
  const web3js = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  return web3js;
}

export function wei2EtherFixed(wei = '0', fixNum = 4) {
  if (/^0$/.test(wei)) {
    return '0.00';
  }
  fixNum = fixNum > 6 || fixNum < 0 ? 2 : fixNum;
  let ether = Web3.utils.fromWei(wei, 'ether');
  return parseFloat(ether).toFixed(fixNum);
}

// export const tokenInfo = async (web3js,ContractName) => {
//   if(!web3js){
//     throw new BizError('web3 instance undefined.', INTERNAL_ERROR);
//   }
//   if(!ContractName || ){
//     throw new BizError(`Token Contract illegal.${ContractName}`, INTERNAL_ERROR);
//   }
// }
