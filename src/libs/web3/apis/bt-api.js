import { validWeb3Addr, validChainAddress } from './validators';
import { BT_TOKEN } from '../contracts/enums';
import BTInterface from '../contracts/abis/BT.json';
import logger from '../../logger';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-14
 *    @comments:
 **********************************************************************/
export const getBalance = async (web3js, chainId, address) => {
  validWeb3Addr(web3js, address);
  const inst = getBTContractInst(web3js, chainId, address);
  logger.debug('getBalance>>>>>>>>>>>>>>>>>>', chainId, address, inst._address);
  const balance = await inst.methods.balanceOf(address).call();
  return balance;
};

export const getBTContractInst = (web3js, chainId, address) => {
  const contractAddress = validChainAddress(chainId, BT_TOKEN);
  let options = {};
  if (address) {
    options.from = address;
  }
  const inst = new web3js.eth.Contract(BTInterface.abi, contractAddress, options);
  return inst;
};

export const getBTContractAddress = (chainId) => {
  const contractAddress = validChainAddress(chainId, BT_TOKEN);
  return contractAddress;
};

export const getAllowance = async (web3js, chainId, owner, spender) => {
  validWeb3Addr(web3js, owner);
  const inst = getBTContractInst(web3js, chainId, owner);

  const allowanceWei = await inst.methods.allowance(owner, spender).call();
  return allowanceWei;
};
