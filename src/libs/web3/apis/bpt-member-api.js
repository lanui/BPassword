import smartInterface from '../contracts/abis/bptMember.json';
import { validChainAddress, validWeb3Addr, validParams } from './validators';
import { BPT_MEMBER } from '../contracts/enums';

import { getBalance, getBTContractInst } from './bt-api';

import { compareWei } from '../web3-helpers';
import BizError from '@lib/biz-error';
import { INSUFFICIENT_BTS_BALANCE, INSUFFICIENT_ETH_BALANCE } from '@lib/biz-error/error-codes';

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

export const getBptMemberAddress = (chainId) => {
  const contractAddress = validChainAddress(chainId, BPT_MEMBER);
  return contractAddress;
};

export const getMemberCostPerYear = async (web3js, chainId, address) => {
  validWeb3Addr(web3js, address);

  const inst = getBPTMemberContractInst(web3js, chainId, address);
  const costWei = await inst.methods.oneYearCost().call();
  return costWei;
};

/**
 *
 * @param {object} web3js required
 * @param {number} chainId required
 * @param {string} address required hex
 */
export const getMemberBaseInFo = async (web3js, chainId, address) => {
  validWeb3Addr(web3js, address);
  const inst = getBPTMemberContractInst(web3js, chainId, address);
  const costWei = await inst.methods.oneYearCost().call();
  const membershipDeadline = await inst.methods.allMembership(address).call();

  return {
    [chainId]: {
      memberCostWeiPerYear: costWei,
      membershipDeadline,
    },
  };
};

/**
 *
 * @param {*} web3js
 * @param {*} chainId
 * @param {*} address
 * @param {*} priKey
 */
export const rechargeMembership = async (web3js, chainId, address, params = {}) => {
  validWeb3Addr(web3js, address);
  validParams(params);
  const { MainPriKey, memberCostWeiPerYear } = params;

  const ethWei = await web3js.eth.getBalance(address).call();

  const tokenInst = getBTContractInst(web3js, chainId, address);
  const btsWei = await tokenInst.methods.balanceOf(address).call();

  if (compareWei(btsWei, memberCostWeiPerYear) < 0) {
    throw new BizError('Insufficient BTs Balance', INSUFFICIENT_BTS_BALANCE);
  }

  const contractAddress = validChainAddress(chainId, BPT_MEMBER);
  const allowanceWei = await tokenInst.methods.allowance(address, contractAddress).call();
};
