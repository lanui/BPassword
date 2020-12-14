import { validWeb3Addr, validChainAddress } from './validators';
import { BT_TOKEN } from '../contracts/enums';
import BTInterface from '../contracts/abis/BT.json';

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
export const getBalance = async (web3js, address, chainId) => {
  validWeb3Addr(web3js, address);
  const inst = getBTContractInst(web3js, chainId, address);
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
