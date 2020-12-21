import { BPT_WEB_STORAGE_EVENT } from '../contracts/enums';
import { validWeb3Addr, validChainAddress } from './validators';
import BTInterface from '../contracts/abis/bptStorageByEvent.json';
import logger from '../../logger';
/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-19
 *    @comments:
 **********************************************************************/

/**
 *
 * @param {object} web3js
 * @param {number} chainId
 * @param {string} address account
 */
export const getWebStorageEventInst = (web3js, chainId, address) => {
  validWeb3Addr(web3js, address);

  const contractAddress = validChainAddress(chainId, BPT_WEB_STORAGE_EVENT);
  const inst = new web3js.eth.Contract(BTInterface.abi, contractAddress, { from: address });

  return inst;
};

export const getWebStorageEventContractAddress = (chainId) => {
  return validChainAddress(chainId, BPT_WEB_STORAGE_EVENT);
};

export const fetchEventLogsFromChain = async (web3js, chainId, selectedAddress, fromBlock) => {
  const inst = getWebStorageEventInst(web3js, chainId, selectedAddress);

  let ret = {
    chainId,
    logs: [],
  };

  const eventLogs = await inst.getPastEvents('Commit', {
    fromBlock: fromBlock || 0,
    toBlock: 'latest',
    filter: { sender: [selectedAddress] },
  });

  if (eventLogs && eventLogs.length > 0) {
    let lastEvent = eventLogs[eventLogs.length - 1];

    ret.blockNumber = lastEvent.blockNumber;
    ret.lastTxHash = lastEvent.transactionHash;

    const logs = eventLogs.map((el) => web3js.utils.hexToBytes(el.returnValues[1]));
    ret.logs = logs;
  }

  return ret;
};
