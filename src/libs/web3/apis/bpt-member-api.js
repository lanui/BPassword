import smartInterface from '../contracts/abis/bptMember.json';
import { validChainAddress, validWeb3Addr } from './validators';
import { BPT_MEMBER } from '../contracts/enums';

/*********************************************************************
 * AircraftClass ::
 *    @description: bptMemeber Smart API
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-15
 *    @comments:
 **********************************************************************/
/**
 *
 * @param {Object} web3js required
 * @param {Number} chainId required
 * @param {String} address optional
 */
export const getBPTMemberContractInst = (web3js, chainId, address) => {
  const contractAddress = validChainAddress(chainId, BPT_MEMBER);
  let options = {};
  if (address) {
    options.from = address;
  }
  const inst = new web3js.eth.Contract(smartInterface.abi, contractAddress, options);
  return inst;
};

export const getMemberCostPerYear = async (web3js, chainId, address) => {
  validWeb3Addr(web3js, address);
};
